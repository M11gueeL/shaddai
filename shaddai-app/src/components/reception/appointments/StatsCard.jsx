import { useEffect, useState } from 'react';
import { Calendar, Users, CalendarPlus, CheckCircle, XCircle, RefreshCw, TrendingUp } from 'lucide-react';
import appointmentsApi from '../../../api/appointments';
import { useAuth } from '../../../context/AuthContext';

export default function StatsCard() {
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
        today_appointments: data.today_appointments ?? 0,
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
      key: 'today_appointments',
      label: 'Citas para Hoy',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: Calendar,
      value: stats?.today_appointments ?? '-'
    },
    {
      key: 'total_patients',
      label: 'Pacientes registrados',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      icon: Users,
      value: stats?.total_patients ?? '-'
    },
    {
      key: 'total_appointments',
      label: 'Total de citas agendadas',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      icon: CalendarPlus,
      value: stats?.total_appointments ?? '-'
    },
    {
      key: 'confirmed_appointments',
      label: 'Citas Confirmadas',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      icon: CheckCircle,
      value: stats?.confirmed_appointments ?? '-'
    },
    {
      key: 'canceled_appointments',
      label: 'Citas Canceladas',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      icon: XCircle,
      value: stats?.canceled_appointments ?? '-'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-500" />
          Resumen de Actividad
        </h3>
        <button 
            onClick={load}
            disabled={loading}
            className={`p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-all active:scale-90 ${loading ? 'animate-spin text-blue-600' : ''}`}
            title="Actualizar"
        >
            <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 mb-4 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Main Stat - Citas Hoy */}
        <div className="col-span-2 bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-center justify-between group hover:shadow-md transition-all duration-300 cursor-default">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Calendar className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">Citas para Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.today_appointments ?? '-'}</p>
                </div>
            </div>
        </div>

        {/* Secondary Stats Grid */}
        {items.slice(1).map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center hover:border-blue-200 hover:bg-white hover:shadow-md transition-all duration-300 group cursor-default">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                <div className={`p-1.5 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
