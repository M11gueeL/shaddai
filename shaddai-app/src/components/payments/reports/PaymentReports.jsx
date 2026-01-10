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
  FileText,
  Users
} from 'lucide-react';
import * as paymentApi from '../../../api/payments';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

// Import Refactored Components
import CashSessionReportModal from './modals/CashSessionReportModal';
import GeneralIncomeReportModal from './modals/GeneralIncomeReportModal';
import ServicesPerformanceModal from './modals/ServicesPerformanceModal';

export default function PaymentReports() {
  const { token } = useAuth();

  // Helper to get dates
  const getInitialDates = () => {
    // 1. Get current date in Caracas Timezone to establish "Today"
    const formatter = new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'America/Caracas',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    // Format returns YYYY-MM-DD
    const caracasDateStr = formatter.format(new Date());
    const [year, month, day] = caracasDateStr.split('-').map(Number);

    // 2. Start Date: Jan 1st of that year
    const startString = `${year}-01-01`;

    // 3. End Date: Tomorrow relative to Caracas "Today"
    // Construct local date object to safely add days without timezone shifts
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + 1);
    
    // Format manually to YYYY-MM-DD to avoid toISOString UTC conversion issues
    const endString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    return {
      start: startString,
      end: endString
    };
  };

  const initialDates = getInitialDates();

  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showGeneralReportModal, setShowGeneralReportModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [statsData, setStatsData] = useState({
    total_income: 0,
    total_receipts: 0,
    total_accounts: 0,
    total_transactions: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await paymentApi.getPaymentStats(startDate, endDate, token);
      if (res.data) {
        setStatsData(res.data);
      }
    } catch (error) {
      console.error("Error fetching payment stats", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Stats derived from API
  const stats = [
    { label: 'Ingresos Totales', value: `$${Number(statsData.total_income).toLocaleString('en-US', {minimumFractionDigits: 2})}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Transacciones Recibidas', value: statsData.total_transactions, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Recibos Generados', value: statsData.total_receipts, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Cuentas Creadas', value: statsData.total_accounts, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
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

  const handleReportAction = async (id) => {
      if (id === 'daily_closing') {
          setShowSessionModal(true);
      } else if (id === 'general_income') {
          setShowGeneralReportModal(true);
      } else if (id === 'debtors') {
          try {
              const response = await paymentApi.downloadDebtorsReportPdf(token);
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `Reporte_Cuentas_Por_Cobrar_${new Date().toISOString().slice(0,10)}.pdf`);
              document.body.appendChild(link);
              link.click();
              link.remove();
          } catch (error) {
              console.error("Failed to download debtors report", error);
              toast.error("Error al descargar el reporte.");
          }
      } else if (id === 'services') {
          setShowServicesModal(true);
      } else {
          toast.error("Próximamente");
      }
  };

  return (
    <>
      {showSessionModal && (
          <CashSessionReportModal 
             token={token}
             startDate={startDate}
             endDate={endDate}
             onClose={() => setShowSessionModal(false)}
          />
      )}

      {showGeneralReportModal && (
          <GeneralIncomeReportModal
             token={token}
             onClose={() => setShowGeneralReportModal(false)}
          />
      )}

      {showServicesModal && (
          <ServicesPerformanceModal
             token={token}
             onClose={() => setShowServicesModal(false)}
          />
      )}

      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes Financieros</h2>
          <p className="text-gray-500 text-sm">Genere y descargue analíticas detalladas de su gestión.</p>
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
         <button onClick={fetchStats} className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
             <Search className="w-4 h-4" />
             {loadingStats ? 'Cargando...' : 'Actualizar Vista'}
         </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
             <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className={`absolute top-0 right-0 p-4 rounded-bl-3xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                    <stat.icon className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                   <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
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

    </div>
    </>
  );
}
