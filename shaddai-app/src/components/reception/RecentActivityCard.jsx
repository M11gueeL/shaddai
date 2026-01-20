import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, CheckCircle, UserPlus, XCircle, AlertCircle, Clock, Activity, RefreshCw } from 'lucide-react';
import activityApi from '../../api/activity';
import { useAuth } from '../../context/AuthContext';

const getIconAndColor = (item) => {
  if (item.type === 'patient_registered') return { Icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-100' };
  if (item.type === 'appointment_created') return { Icon: CalendarPlus, color: 'text-violet-600', bg: 'bg-violet-100' };
  if (item.type === 'appointment_status') {
    const ns = item?.meta?.new_status;
    if (ns === 'confirmada') return { Icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (ns === 'cancelada') return { Icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100' };
    if (ns === 'en_progreso') return { Icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' };
    if (ns === 'completada') return { Icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-100' };
    if (ns === 'no_se_presento') return { Icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100' };
    return { Icon: CalendarPlus, color: 'text-gray-600', bg: 'bg-gray-100' };
  }
  return { Icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100' };
};

const timeAgoEs = (ts) => {
  try {
    const d = new Date(ts);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (Number.isNaN(diffSec)) return '';
    if (diffSec < 60) return `Hace ${diffSec} seg`;
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs} h`;
    const days = Math.floor(hrs / 24);
    return `Hace ${days} d`;
  } catch (e) { return ''; }
};

export default function RecentActivityCard() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async (isRefresh = false) => {
    if (!token) return;
    try {
      if (!isRefresh) setLoading(true);
      const res = await activityApi.getRecent(5);
      const data = res?.data?.data || [];
      setItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar la actividad');
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 20000);
    return () => clearInterval(timer);
  }, [token]);

  const content = useMemo(() => {
    if (loading) return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-100 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
    if (error) return <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>;
    if (!items?.length) return <div className="text-sm text-gray-500 text-center py-8">Sin actividad reciente</div>;

    // Helper: intenta obtener el nombre del médico desde meta con varias claves posibles
    const getDoctorName = (meta) => {
      if (!meta) return '';
      const direct = meta.doctor_name || meta.doctorName || meta.medico_nombre || meta.medicoNombre;
      if (direct) return String(direct).trim();
      const fromObj = meta.doctor || meta.medico || {};
      const full = fromObj.full_name || fromObj.fullName || fromObj.name;
      if (full) return String(full).trim();
      const composed = [fromObj.first_name || fromObj.firstName, fromObj.last_name || fromObj.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      return composed || '';
    };

    // Helper: agrega prefijo Dr. al nombre del médico dentro del texto si aparece
    const prefixDoctorInText = (text, doctorName) => {
      if (!text || !doctorName) return text;
      const target = String(doctorName).trim();
      const prefixedDot = `Dr. ${target}`;
      const prefixedNoDot = `Dr ${target}`;
      // Si ya está con prefijo, devolver sin cambios
      if (text.includes(prefixedDot) || text.includes(prefixedNoDot)) return text;
      // Si el nombre aparece "pelado", reemplazar todas las ocurrencias exactas del nombre
      // Evitar regex complejos; usar split/join para evitar issues con caracteres especiales
      if (text.includes(target)) {
        return text.split(target).join(prefixedDot);
      }
      return text;
    };

    return (
      <div className="flex flex-col gap-1">
        {items.map((activity, idx) => {
          const { Icon, color, bg } = getIconAndColor(activity);
          const isAppointmentEvent = activity?.type === 'appointment_created' || activity?.type === 'appointment_status';
          const doctorName = isAppointmentEvent ? getDoctorName(activity?.meta) : '';
          const actionText = isAppointmentEvent ? prefixDoctorInText(activity?.action || '', doctorName) : (activity?.action || '');
          // Si viene en formato "Paciente - Doctor" desde el backend, añadimos prefijo al doctor.
          let detailsText = activity?.details || '';
          if (isAppointmentEvent && typeof detailsText === 'string') {
            const parts = detailsText.split(' - ').map(s => (s || '').trim()).filter(Boolean);
            if (parts.length >= 2) {
              const patient = parts[0];
              const doctor = parts[parts.length - 1];
              const doctorWithPrefix = /^Dr\.?\s/i.test(doctor) ? doctor : `Dr. ${doctor}`;
              detailsText = `${patient} - ${doctorWithPrefix}`;
            } else {
              // fallback al método de reemplazo si no viene con separador esperado
              detailsText = prefixDoctorInText(detailsText, doctorName);
            }
          }
          return (
            <div key={idx} className="group flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100">
              <div className={`p-2 rounded-full ${bg} ${color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <Icon size={16} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="font-semibold text-gray-900 text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                    {actionText}
                </div>
                <div className="text-xs text-gray-500 truncate mb-1.5 font-medium">
                    {detailsText}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <Clock size={10} />
                    {timeAgoEs(activity.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [items, loading, error]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Actividad Reciente
        </h3>
        <button 
            onClick={() => load(false)} 
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-90"
            title="Actualizar"
        >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden mt-2">
        {content}
      </div>
    </div>
  );
}
