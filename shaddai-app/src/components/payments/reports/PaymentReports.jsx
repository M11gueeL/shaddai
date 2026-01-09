import React, { useState, useEffect } from 'react';
import { 
  FileBarChart, 
  CalendarDays, 
  Download, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  PieChart as PieIcon,
  Search,
  ArrowRight,
  X,
  User,
  CheckCircle2
} from 'lucide-react';
import * as cashApi from '../../../api/cashregister';
import { useAuth } from '../../../context/AuthContext';

// Este es solo un componente de interfaz visual (mock), la funcionalidad se agregará después.

export default function PaymentReports() {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('daily'); // daily | monthly | custom
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Mock stats
  const stats = [
    { label: 'Ingresos Totales', value: '$12,450.00', trend: '+12%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Transacciones', value: '145', trend: '+5%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Promedio Ticket', value: '$85.00', trend: '-2%', icon: PieIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const reportCards = [
    {
      id: 'general_income',
      title: 'Reporte General de Ingresos',
      description: 'Resumen detallado de todos los ingresos clasificados por método de pago y moneda.',
      icon: DollarSign,
      color: 'indigo'
    },
    {
      id: 'daily_closing',
      title: 'Cierre de Caja Diario',
      description: 'Detalle de movimientos de caja, efectivo en mano y arqueo de cierre.',
      icon: CalendarDays,
      color: 'emerald'
    },
    {
      id: 'debtors',
      title: 'Cuentas por Cobrar',
      description: 'Listado de pacientes con saldos pendientes y antigüedad de la deuda.',
      icon: FileBarChart,
      color: 'rose'
    },
    {
      id: 'services',
      title: 'Rendimiento por Servicios',
      description: 'Análisis de los servicios más solicitados y mayor facturación.',
      icon: PieIcon,
      color: 'amber'
    }
  ];

  const handleReportAction = (id) => {
      if (id === 'daily_closing') {
          setShowSessionModal(true);
      } else {
          alert("Próximamente");
      }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative">
      
      {showSessionModal && (
          <CashSessionReportModal 
             token={token}
             startDate={startDate}
             endDate={endDate}
             onClose={() => setShowSessionModal(false)}
          />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes Financieros</h2>
          <p className="text-gray-500 text-sm">Genere y descargue analíticas detalladas de su gestión.</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
           {['daily', 'monthly', 'custom'].map((type) => (
             <button
               key={type}
               onClick={() => setReportType(type)}
               className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                 reportType === type 
                 ? 'bg-gray-900 text-white shadow-md' 
                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
               }`}
             >
               {type === 'daily' && 'Diario'}
               {type === 'monthly' && 'Mensual'}
               {type === 'custom' && 'Personalizado'}
             </button>
           ))}
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                 <Filter className="w-5 h-5" />
             </div>
             <div className="flex-1 md:flex-none flex items-center gap-2">
                 <div className="flex flex-col">
                     <label className="text-[10px] font-bold text-gray-400 uppercase">Desde</label>
                     <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="font-medium text-gray-900 bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-indigo-500 transition-colors"
                     />
                 </div>
                 <span className="text-gray-300">-</span>
                 <div className="flex flex-col">
                     <label className="text-[10px] font-bold text-gray-400 uppercase">Hasta</label>
                     <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="font-medium text-gray-900 bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-indigo-500 transition-colors"
                     />
                 </div>
             </div>
         </div>
         <button className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
             <Search className="w-4 h-4" />
             Actualizar Vista
         </button>
      </div>

      {/* Stats Overview (Mock) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
             <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className={`absolute top-0 right-0 p-4 rounded-bl-3xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                    <stat.icon className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                   <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                   <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {stat.trend} vs periodo anterior
                   </span>
                </div>
             </div>
          ))}
      </div>

      {/* Available Reports Grid */}
      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Reportes Disponibles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {reportCards.map((card) => (
            <div key={card.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:border-indigo-100 transition-all group flex flex-col">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors bg-${card.color}-50 text-${card.color}-600 group-hover:bg-${card.color}-100`}>
                   <card.icon className="w-6 h-6" />
               </div>
               <h4 className="font-bold text-gray-900 mb-2">{card.title}</h4>
               <p className="text-sm text-gray-500 mb-6 flex-1">{card.description}</p>
               
               <button 
                   onClick={() => handleReportAction(card.id)}
                   className="w-full py-3 rounded-xl bg-gray-50 text-gray-600 font-medium hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-lg">
                   <span>Generar</span>
                   <Download className="w-4 h-4" />
               </button>
            </div>
         ))}
      </div>

      {/* Recent generations table (Mock) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 className="font-bold text-gray-900">Historial de Descargas</h3>
             <button className="text-sm text-indigo-600 font-medium hover:underline">Ver todo</button>
         </div>
         <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50/50 text-gray-500">
                     <tr>
                         <th className="px-6 py-4 font-semibold">Reporte</th>
                         <th className="px-6 py-4 font-semibold">Fecha Generado</th>
                         <th className="px-6 py-4 font-semibold">Generado Por</th>
                         <th className="px-6 py-4 font-semibold text-right">Acción</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                     {[1,2,3].map(i => (
                         <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                             <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><FileBarChart className="w-4 h-4" /></div>
                                 Reporte General de Ingresos
                             </td>
                             <td className="px-6 py-4 text-gray-500">09 Ene 2026, 10:30 AM</td>
                             <td className="px-6 py-4 text-gray-500">Admin</td>
                             <td className="px-6 py-4 text-right">
                                 <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">
                                     Descargar PDF
                                 </button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </div>

    </div>
  );
}

function CashSessionReportModal({ token, startDate, endDate, onClose }) {
    const [sessions, setSessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('all');
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        setLoading(true);
        cashApi.adminListSessions(token, 'closed') // Only closed sessions
            .then(res => {
                const data = res.data || [];
                // Filter by date range (start_time)
                // Note: start_time is YYYY-MM-DD HH:mm:ss
                const start = new Date(startDate); start.setHours(0,0,0,0);
                const end = new Date(endDate); end.setHours(23,59,59,999);
                
                const inRange = data.filter(s => {
                    const d = new Date(s.start_time);
                    return d >= start && d <= end;
                });
                
                setSessions(inRange);
                setFilteredSessions(inRange);

                // Extract unique users
                const u = [];
                const seen = new Set();
                inRange.forEach(s => {
                    if (!seen.has(s.user_id)) {
                        seen.add(s.user_id);
                        u.push({ id: s.user_id, name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || `User ${s.user_id}` });
                    }
                });
                setUsers(u);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [token, startDate, endDate]);

    useEffect(() => {
        if (selectedUser === 'all') {
            setFilteredSessions(sessions);
        } else {
            setFilteredSessions(sessions.filter(s => String(s.user_id) === String(selectedUser)));
        }
    }, [selectedUser, sessions]);

    const handleDownload = async (sessionId) => {
        try {
            setDownloading(sessionId);
            const response = await cashApi.downloadSessionReport(sessionId, token);
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Caja_${sessionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading report", error);
            alert("Error al descargar el reporte.");
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-[2rem]">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Reportes de Cierre de Caja</h3>
                        <p className="text-sm text-gray-500">
                            Periodo: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 border-b border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Filtrar por Cajero/Usuario</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button 
                            onClick={() => setSelectedUser('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${selectedUser === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Todos ({sessions.length})
                        </button>
                        {users.map(u => (
                            <button 
                                key={u.id}
                                onClick={() => setSelectedUser(u.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${String(selectedUser) === String(u.id) ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {u.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                            <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            No se encontraron sesiones cerradas en este periodo.
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredSessions.map(s => (
                                <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                            {s.id}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                {s.first_name} {s.last_name}
                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                    ID: {s.user_id}
                                                </span>
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {new Date(s.start_time).toLocaleString()} — {s.end_time ? new Date(s.end_time).toLocaleString() : 'En curso'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-gray-400 font-bold uppercase">Total Declarado</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                ${Number(s.real_end_balance_usd || 0).toFixed(2)} / Bs {Number(s.real_end_balance_bs || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => handleDownload(s.id)}
                                            disabled={downloading === s.id}
                                            className="px-4 py-2 bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-600 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                                        >
                                            {downloading === s.id ? (
                                                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                                            ) : (
                                                <Download className="w-4 h-4" />
                                            )}
                                            <span className="hidden sm:inline">Descargar PDF</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-[2rem] text-center">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-medium text-sm">Cerrar Ventana</button>
                </div>
            </div>
        </div>
    );
}
