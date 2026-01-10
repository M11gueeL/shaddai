import React, { useState } from 'react';
import { 
    DollarSign, 
    X, 
    CalendarDays, 
    Filter, 
    Download, 
    Banknote, 
    Smartphone, 
    CreditCard, 
    FileText 
} from 'lucide-react';
import * as paymentApi from '../../../../api/payments';
import SummaryCard from '../components/SummaryCard';
import BadgeType from '../components/BadgeType';
import StatusBadge from '../components/StatusBadge';
import { combineAndSortTimeline } from '../utils/reportUtils';

export default function GeneralIncomeReportModal({ token, onClose }) {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await paymentApi.getGeneralReport(startDate, endDate, token);
            setReport(res.data);
        } catch (error) {
            console.error(error);
            alert("Error al generar el reporte");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        setGeneratingPdf(true);
        try {
            const response = await paymentApi.downloadGeneralReportPdf(startDate, endDate, token);
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Ingresos_${startDate}_${endDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading PDF", error);
            alert("Error al descargar el PDF");
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-[2rem]">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Reporte General de Ingresos</h3>
                            <p className="text-sm text-gray-500">Resumen detallado y auditoría de flujo de caja</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-gray-100 bg-white grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="col-span-12 md:col-span-6 lg:col-span-4 space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                            Rango de Análisis
                        </label>
                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-sm">
                             <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-transparent px-2 py-1.5 text-sm font-medium text-gray-700 outline-none"
                             />
                             <span className="text-gray-300 text-xs font-bold px-1">A</span>
                             <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-transparent px-2 py-1.5 text-sm font-medium text-gray-700 outline-none"
                             />
                        </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-3">
                        <button 
                            onClick={generateReport}
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <Filter className="w-4 h-4" />}
                            Generar Reporte
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/30">
                    {!report && !loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10">
                            <div className="w-20 h-20 bg-gray-100/80 rounded-full flex items-center justify-center mb-4">
                                <DollarSign className="w-10 h-10 opacity-20" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-1">Esperando Generación</h4>
                            <p className="text-sm">Seleccione un rango de fechas y presione Generar</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            
                            {/* Summary Cards */}
                            {report && (
                                <div className="space-y-6">
                                    <div className="flex justify-end p-2">
                                        <button 
                                            onClick={handleDownloadPdf}
                                            disabled={generatingPdf}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold border border-indigo-200 transition-colors"
                                        >
                                            {generatingPdf ? <span className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></span> : <Download className="w-4 h-4" />}
                                            Descargar PDF Oficial
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <SummaryCard 
                                        icon={DollarSign} 
                                        label="Total Percibido (USD Eq)" 
                                        value={`$${report.summary.total_global_usd_eq.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
                                        subtext="Suma de todas las monedas"
                                        color="emerald"
                                        bg="emerald"
                                    />
                                    <SummaryCard 
                                        icon={Banknote} 
                                        label="Efectivo USD" 
                                        value={`$${report.summary.usd_cash.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
                                        subtext="Físico en caja"
                                        color="green"
                                        bg="green"
                                    />
                                    <SummaryCard 
                                        icon={Smartphone} 
                                        label="Pago Movil + Transf BS" 
                                        value={`Bs ${(report.summary.bs_mobile + report.summary.bs_transfer).toLocaleString('es-VE', {minimumFractionDigits: 2})}`}
                                        subtext="Bancos Nacionales"
                                        color="blue"
                                        bg="blue"
                                    />
                                    <SummaryCard 
                                        icon={CreditCard} 
                                        label="Zelle" 
                                        value={`$${report.summary.zelle.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
                                        subtext="Transferencias USA"
                                        color="purple"
                                        bg="purple"
                                    />
                                </div>
                                </div>
                            )}

                            {/* Detailed List */}
                            {report && (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                     <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                         <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                             <FileText className="w-4 h-4 text-gray-500" />
                                             Cronología Detallada
                                         </h4>
                                         <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                             {report.details.all_movements.length + report.details.receipts.length + report.details.new_accounts.length} Eventos
                                         </span>
                                     </div>
                                     <div className="overflow-x-auto">
                                         <table className="w-full text-sm text-left">
                                             <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                                 <tr>
                                                     <th className="px-6 py-3 w-32">Fecha/Hora</th>
                                                     <th className="px-6 py-3 w-40">Tipo</th>
                                                     <th className="px-6 py-3">Descripción / Referencia</th>
                                                     <th className="px-6 py-3">Responsable</th>
                                                     <th className="px-6 py-3 w-32 text-right">Monto</th>
                                                     <th className="px-6 py-3 w-28 text-center">Estado</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-100">
                                                 {combineAndSortTimeline(report).map((item, idx) => (
                                                     <tr key={`${item.type}-${item.id}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                                                         <td className="px-6 py-3 text-gray-500 text-xs font-mono">
                                                             {new Date(item.date).toLocaleString()}
                                                         </td>
                                                         <td className="px-6 py-3">
                                                             <BadgeType type={item.type} method={item.method} />
                                                         </td>
                                                         <td className="px-6 py-3">
                                                             <div className="flex flex-col">
                                                                 <span className="font-medium text-gray-900">{item.mainText}</span>
                                                                 {item.subText && <span className="text-xs text-gray-400">{item.subText}</span>}
                                                             </div>
                                                         </td>
                                                         <td className="px-6 py-3 text-gray-600 text-xs">
                                                             {item.user}
                                                         </td>
                                                         <td className="px-6 py-3 text-right font-bold text-gray-800 font-mono">
                                                             {item.amountDisplay}
                                                         </td>
                                                         <td className="px-6 py-3 text-center">
                                                             <StatusBadge status={item.status} />
                                                         </td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                     </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
