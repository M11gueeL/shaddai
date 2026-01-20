import React, { useState, useEffect } from 'react';
import { 
    Download, 
    X, 
    CalendarDays, 
    User, 
    Search, 
    ScanBarcode, 
    Filter, 
    ArrowRight 
} from 'lucide-react';
import * as cashApi from '../../../../api/cashregister';
import ClockIcon from '../components/ClockIcon';

export default function CashSessionReportModal({ token, startDate: defaultStartDate, endDate: defaultEndDate, onClose }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);
    
    // Filters & Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    
    const [startDate, setStartDateFilter] = useState(defaultStartDate);
    const [endDate, setEndDateFilter] = useState(defaultEndDate);
    const [userSearch, setUserSearch] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [statusFilter, setStatusFilter] = useState('closed');

    useEffect(() => {
        fetchSessions();
    }, [page, limit, startDate, endDate, statusFilter]); // Auto-refresh on these changes

    // Search buffer for text inputs to avoid too many requests
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (page !== 1) setPage(1); // Reset to page 1 on search change
            else fetchSessions();
        }, 600);
        return () => clearTimeout(timeout);
    }, [userSearch, sessionId]);

    const fetchSessions = () => {
        setLoading(true);
        const params = {
            page, 
            limit,
            status: statusFilter === 'all' ? '' : statusFilter, 
            startDate, 
            endDate, 
            userSearch, 
            sessionId
        };

        cashApi.adminListSessions(params)
            .then(res => {
                if(res.data) {
                   setSessions(res.data.data || []);
                   setTotalRecords(res.data.total || 0);
                   setTotalPages(res.data.last_page || 1);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleDownload = async (sid) => {
        try {
            setDownloading(sid);
            const response = await cashApi.downloadSessionReport(sid);
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Caja_${sid}.pdf`);
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
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-[2rem]">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Reporte de Sesiones de Caja</h3>
                        <p className="text-sm text-gray-500">Historial y resumen de cierres de caja</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-gray-100 bg-white grid grid-cols-12 gap-4 items-end">
                    
                    {/* Date Range - Col Span 12 (Mobile) -> 4 (Desktop) */}
                    <div className="col-span-12 md:col-span-4 space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                            Rango de Fechas
                        </label>
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500 transition-all shadow-sm">
                             <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDateFilter(e.target.value)}
                                className="w-full bg-transparent px-3 py-2 text-sm font-medium text-gray-700 outline-none border-none placeholder-gray-400"
                             />
                             <span className="text-gray-300 font-light">|</span>
                             <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDateFilter(e.target.value)}
                                className="w-full bg-transparent px-3 py-2 text-sm font-medium text-gray-700 outline-none border-none placeholder-gray-400"
                             />
                        </div>
                    </div>
                    
                    {/* User Search - Col Span 12 -> 4 */}
                    <div className="col-span-12 md:col-span-4 space-y-1.5">
                         <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                             <User className="w-3.5 h-3.5 text-indigo-500" />
                             Buscar Usuario
                         </label>
                         <div className="relative group">
                            <input 
                                type="text"
                                placeholder="Nombre, Cédula, Email, Teléfono..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-gray-400 shadow-sm"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 group-focus-within:text-indigo-500 transition-colors" />
                         </div>
                    </div>

                    {/* Session ID - Col Span 6 -> 2 */}
                    <div className="col-span-6 md:col-span-2 space-y-1.5">
                         <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                             <ScanBarcode className="w-3.5 h-3.5 text-indigo-500" />
                             ID Sesión
                         </label>
                         <input 
                                type="text"
                                placeholder="#"
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-gray-400 shadow-sm text-center"
                         />
                    </div>
                    
                    {/* Status - Col Span 6 -> 2 */}
                    <div className="col-span-6 md:col-span-2 space-y-1.5">
                         <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                             <Filter className="w-3.5 h-3.5 text-indigo-500" />
                             Estado
                         </label>
                         <div className="relative">
                             <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-sm disabled:opacity-50"
                             >
                                 <option value="closed">Cerradas</option>
                                 <option value="open">Abiertas</option>
                                 <option value="all">Todas</option>
                             </select>
                             <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                             </div>
                         </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-white">
                            <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            No se encontraron sesiones con estos filtros.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map(s => (
                                <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md transition-shadow group gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${s.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {s.id}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold text-gray-900">{s.first_name} {s.last_name}</h4>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">ID: {s.user_id}</span>
                                                <span className="text-[10px] text-gray-400">{s.email}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                <ClockIcon className="w-3 h-3" />
                                                <span>Apertura: {new Date(s.start_time).toLocaleString()}</span>
                                                {s.end_time && (
                                                    <>
                                                        <span className="text-gray-300">|</span>
                                                        <span>Cierre: {new Date(s.end_time).toLocaleString()}</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                        {s.status === 'closed' && (
                                            <div className="text-right mr-4">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Declarado</p>
                                                <div className="flex gap-3 text-sm font-bold text-gray-900">
                                                    <span>${Number(s.real_end_balance_usd || 0).toFixed(2)}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>Bs {Number(s.real_end_balance_bs || 0).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {s.status === 'closed' ? (
                                            <button 
                                                onClick={() => handleDownload(s.id)}
                                                disabled={downloading === s.id}
                                                className="px-4 py-2 bg-white border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-sm"
                                            >
                                                {downloading === s.id ? (
                                                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                                                ) : (
                                                    <Download className="w-4 h-4" />
                                                )}
                                                <span className="hidden sm:inline">PDF</span>
                                            </button>
                                        ) : (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">ABIERTA</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-gray-100 bg-white rounded-b-[2rem] flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                        Mostrando {sessions.length} de {totalRecords} registros
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                        </button>
                        <span className="text-sm font-medium text-gray-700">Página {page} de {totalPages}</span>
                        <button 
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
