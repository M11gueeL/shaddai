import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, CheckCircle, UserPlus, XCircle, AlertCircle, Clock } from 'lucide-react';
import activityApi from '../../api/activity';
import { useAuth } from '../../context/AuthContext';

const cardBase = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";

const getIconAndColor = (item) => {
  if (item.type === 'patient_registered') return { Icon: UserPlus, color: 'text-blue-600' };
  if (item.type === 'appointment_created') return { Icon: CalendarPlus, color: 'text-green-600' };
  if (item.type === 'appointment_status') {
    const ns = item?.meta?.new_status;
    if (ns === 'confirmada') return { Icon: CheckCircle, color: 'text-emerald-600' };
    if (ns === 'cancelada') return { Icon: XCircle, color: 'text-red-600' };
    if (ns === 'en_progreso') return { Icon: Clock, color: 'text-indigo-600' };
    if (ns === 'completada') return { Icon: CheckCircle, color: 'text-green-600' };
    if (ns === 'no_se_presento') return { Icon: AlertCircle, color: 'text-yellow-600' };
    return { Icon: CalendarPlus, color: 'text-gray-600' };
  }
  return { Icon: CalendarPlus, color: 'text-gray-600' };
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

  useEffect(() => {
    if (!token) return;
    let alive = true;
    let timer;
    const load = async () => {
      try {
        setLoading(true);
        const res = await activityApi.getRecent(token, 5);
        const data = res?.data?.data || [];
        if (alive) setItems(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (alive) setError(err.response?.data?.error || 'No se pudo cargar la actividad');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    // refresh every 20s
    timer = setInterval(load, 20000);
    return () => { alive = false; if (timer) clearInterval(timer); };
  }, [token]);

  const content = useMemo(() => {
    if (loading) return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
    if (error) return <div className="text-sm text-red-600">{error}</div>;
    if (!items?.length) return <div className="text-sm text-gray-500">Sin actividad hoy</div>;

    return (
      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {items.map((activity, idx) => {
          const { Icon, color } = getIconAndColor(activity);
          return (
            <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Icon className={`w-5 h-5 ${color} mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{activity.action}</div>
                <div className="text-sm text-gray-600 truncate">{activity.details}</div>
                <div className="text-xs text-gray-500">{timeAgoEs(activity.timestamp)}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [items, loading, error]);

  return (
    <div className={cardBase}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
      {content}
    </div>
  );
}
