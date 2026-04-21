import React, { useEffect, useState } from 'react';
import { History, Archive, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as cashApi from '../../../api/cashregister';
import { useToast } from '../../../context/ToastContext';
import SessionDetailModal from './SessionDetailModal';

export default function SessionsAdmin() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const load = async () => {
    try { 
        setLoading(true); 
        const res = await cashApi.adminListSessions(); 
        // Handle paginated response { data, total, ... } vs old array response
        setItems(res.data.data ? res.data.data : (Array.isArray(res.data) ? res.data : [])); 
    } catch (e) { 
        toast.error('No se pudo cargar sesiones'); 
    } finally { 
        setLoading(false); 
    }
  };
  useEffect(() => { load(); }, []);

  const formatUser = (s) => {
    const fn = s.first_name || s.firstName || ''; 
    const ln = s.last_name || s.lastName || '';
    const full = [fn, ln].filter(Boolean).join(' ');
    return full || `Usuario ${s.user_id}`;
  };

  const formatDateTime = (dt) => {
    if (!dt) return '-';
    const norm = typeof dt === 'string' && dt.includes(' ') && !dt.includes('T') ? dt.replace(' ', 'T') : dt;
    const d = new Date(norm);
    if (Number.isNaN(d.getTime())) return dt;
    return d.toLocaleString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

   const amount = (value) => Number(value || 0);

   const getReconciliationState = (session) => {
      if (session.status === 'open') {
         return {
            label: 'Abierta',
            chipClass: 'bg-emerald-100 text-emerald-700',
            icon: null,
            detail: 'En curso'
         };
      }

      const diffUsd = amount(session.difference_usd);
      const diffBs = amount(session.difference_bs);
      const hasUsdDiff = Math.abs(diffUsd) >= 0.01;
      const hasBsDiff = Math.abs(diffBs) >= 0.01;

      if (!hasUsdDiff && !hasBsDiff) {
         return {
            label: 'Cuadrada',
            chipClass: 'bg-emerald-100 text-emerald-700',
            icon: CheckCircle2,
            detail: 'Sin diferencia'
         };
      }

      if (diffUsd < -0.009 || diffBs < -0.009) {
         return {
            label: 'Faltante',
            chipClass: 'bg-red-100 text-red-700',
            icon: AlertTriangle,
            detail: 'Diferencia negativa'
         };
      }

      return {
         label: 'Sobrante',
         chipClass: 'bg-amber-100 text-amber-700',
         icon: AlertTriangle,
         detail: 'Diferencia positiva'
      };
   };

   const formatDifference = (value, currency) => {
      const n = amount(value);
      const sign = n > 0 ? '+' : '';
      return `${currency} ${sign}${n.toFixed(2)}`;
   };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {selectedSessionId && (
        <SessionDetailModal 
          sessionId={selectedSessionId} 
          onClose={() => setSelectedSessionId(null)} 
        />
      )}

      <div className="flex justify-between items-center mb-6">
         <div>
            <h3 className="text-xl font-bold text-gray-900">Historial de Sesiones</h3>
            <p className="text-sm text-gray-500">Monitor de aperturas y cierres de caja</p>
         </div>
         <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-colors">
            <History className="w-4 h-4" /> Actualizar
         </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Sin registros de sesiones</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
               {items.map((s) => {
                  const reconciliation = getReconciliationState(s);
                  const StatusIcon = reconciliation.icon;

                  return (
            <button 
                key={s.id} 
                onClick={() => setSelectedSessionId(s.id)}
                className="group flex flex-col p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-300 text-left w-full"
            >
              <div className="flex justify-between items-start mb-4 w-full">
                 <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                       <Archive className="w-5 h-5" />
                    </div>
                    <div>
                       <div className="font-bold text-gray-900">Sesión #{s.id}</div>
                       <div className="text-xs text-gray-500">{formatUser(s)}</div>
                    </div>
                 </div>
                 <div className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase ${reconciliation.chipClass}`}>
                    {reconciliation.label}
                 </div>
              </div>

              {StatusIcon && (
                <div className="mb-3 text-xs text-gray-600 flex items-center gap-2">
                  <StatusIcon className="w-3.5 h-3.5" />
                  {reconciliation.detail}
                </div>
              )}

              <div className="space-y-2 mb-4 flex-1">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Apertura</span>
                    <span className="font-mono text-gray-900 font-medium">{formatDateTime(s.start_time || s.opened_at)}</span>
                 </div>
                 {s.status !== 'open' && (
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-500">Cierre</span>
                       <span className="font-mono text-gray-900 font-medium">{s.end_time || s.closed_at ? formatDateTime(s.end_time || s.closed_at) : '-'}</span>
                    </div>
                 )}
              </div>

              <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-3">
                 <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Base USD</div>
                    <div className="font-bold text-gray-900">${Number(s.start_balance_usd || 0).toFixed(2)}</div>
                 </div>
                 <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Base Bs</div>
                    <div className="font-bold text-gray-900">Bs {Number(s.start_balance_bs || 0).toFixed(2)}</div>
                 </div>
              </div>

                     {s.status !== 'open' && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                           <div className="bg-indigo-50 rounded-lg p-2 text-center">
                              <div className="text-[10px] text-indigo-500 uppercase font-bold">Declarado USD</div>
                              <div className="font-bold text-indigo-700">${amount(s.real_end_balance_usd).toFixed(2)}</div>
                           </div>
                           <div className="bg-indigo-50 rounded-lg p-2 text-center">
                              <div className="text-[10px] text-indigo-500 uppercase font-bold">Declarado BS</div>
                              <div className="font-bold text-indigo-700">Bs {amount(s.real_end_balance_bs).toFixed(2)}</div>
                           </div>
                        </div>
                     )}

                     {s.status !== 'open' && (
                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-semibold">
                           <div className={`${amount(s.difference_usd) < 0 ? 'text-red-600' : amount(s.difference_usd) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              Dif. USD: {formatDifference(s.difference_usd, 'USD')}
                           </div>
                           <div className={`${amount(s.difference_bs) < 0 ? 'text-red-600' : amount(s.difference_bs) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              Dif. BS: {formatDifference(s.difference_bs, 'BS')}
                           </div>
                        </div>
                     )}

                     {s.notes && (
                        <div className="mt-3 text-xs text-gray-600 line-clamp-2 bg-amber-50 border border-amber-100 rounded-lg p-2">
                           <span className="font-semibold">Nota:</span> {s.notes}
                        </div>
                     )}
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
