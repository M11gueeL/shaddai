import { useEffect, useState } from 'react';
import { Calendar, Users, CalendarPlus, CheckCircle, XCircle } from 'lucide-react';
import appointmentsApi from '../../../api/appointments';
import { useAuth } from '../../../context/AuthContext';

export default function StatsCard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await appointmentsApi.getStats(token);
        const data = res?.data?.data || res?.data || {};
        if (mounted) {
          setStats({
            today_appointments: data.today_appointments ?? 0,
            total_patients: data.total_patients ?? 0,
            total_appointments: data.total_appointments ?? 0,
            confirmed_appointments: data.confirmed_appointments ?? 0,
            canceled_appointments: data.canceled_appointments ?? 0,
          });
          setError(null);
        }
      } catch (e) {
        if (mounted) setError('No se pudo cargar las estadísticas');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 30000); // refrescar cada 30s
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [token]);

  const items = [
    {
      key: 'today_appointments',
      label: 'Citas Hoy',
      color: 'text-blue-600',
      icon: Calendar,
      value: stats?.today_appointments ?? '-'
    },
    {
      key: 'total_patients',
      label: 'Pacientes',
      color: 'text-green-600',
      icon: Users,
      value: stats?.total_patients ?? '-'
    },
    {
      key: 'total_appointments',
      label: 'Citas Totales',
      color: 'text-indigo-600',
      icon: CalendarPlus,
      value: stats?.total_appointments ?? '-'
    },
    {
      key: 'confirmed_appointments',
      label: 'Confirmadas',
      color: 'text-emerald-600',
      icon: CheckCircle,
      value: stats?.confirmed_appointments ?? '-'
    },
    {
      key: 'canceled_appointments',
      label: 'Canceladas',
      color: 'text-rose-600',
      icon: XCircle,
      value: stats?.canceled_appointments ?? '-'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
        {loading && (
          <span className="text-xs text-gray-500">Actualizando…</span>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2 mb-3">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {items.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Icon className={`w-5 h-5 ${stat.color} mr-3`} />
                <span className="text-sm text-gray-700">{stat.label}</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
