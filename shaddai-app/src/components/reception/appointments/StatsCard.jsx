import { useEffect, useState } from 'react';
import { Calendar, Users, CalendarPlus, CheckCircle } from 'lucide-react';
import appointmentsApi from '../../../api/appointments';
import { useAuth } from '../../../context/AuthContext';

export default function StatsCard({ variant = 'default' }) {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await appointmentsApi.getStats(token);
      const data = res?.data?.data || res?.data || {};
      setStats({
        completed_appointments: data.completed_appointments ?? 0,
        total_patients: data.total_patients ?? 0,
        total_appointments: data.total_appointments ?? 0,
        confirmed_appointments: data.confirmed_appointments ?? 0,
        canceled_appointments: data.canceled_appointments ?? 0,
      });
      setError(null);
    } catch (e) {
      setError('Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [token]);

  const items = [
    {
      key: 'completed_appointments',
      label: 'Completadas',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      icon: CheckCircle,
      value: stats?.completed_appointments ?? '-'
    },
    {
      key: 'confirmed_appointments',
      label: 'Confirmadas',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      icon: Calendar,
      value: stats?.confirmed_appointments ?? '-'
    },
    {
      key: 'total_appointments',
      label: 'Agendadas',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      icon: CalendarPlus,
      value: stats?.total_appointments ?? '-'
    },
    {
      key: 'total_patients',
      label: 'Pacientes',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      icon: Users,
      value: stats?.total_patients ?? '-'
    }
  ];

  const isHeader = variant === 'header';

  return (
    <div className="w-full">
      <div className={`grid grid-cols-2 lg:grid-cols-4 ${isHeader ? 'gap-3' : 'gap-4'}`}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={
                isHeader
                  ? `rounded-2xl px-4 py-3 border ${item.border} bg-white/85 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 group`
                  : `bg-white rounded-2xl p-4 border ${item.border} shadow-sm hover:shadow-md transition-all duration-300 group`
              }
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={isHeader ? 18 : 20} />
                </div>
              </div>
              <div>
                <div className={`${isHeader ? 'text-2xl' : 'text-2xl'} font-bold text-gray-800 mb-0.5`}>
                  {loading ? '...' : item.value}
                </div>
                <div className={`font-medium text-gray-500 uppercase tracking-wide ${isHeader ? 'text-[11px]' : 'text-xs'}`}>
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {error && <div className={`text-xs text-red-500 mt-2 ${isHeader ? 'text-left' : 'text-center'}`}>{error}</div>}
    </div>
  );
}
