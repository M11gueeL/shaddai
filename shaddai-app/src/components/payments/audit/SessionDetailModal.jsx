// src/components/payments/audit/SessionDetailModal.jsx
import React, { useEffect, useState } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';
import * as cashApi from '../../../api/cashregister';
import { useAuth } from '../../../context/AuthContext';

export default function SessionDetailModal({ sessionId, onClose }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    cashApi.getSessionDetails(sessionId, token)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [sessionId, token]);

  if (!sessionId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl backdrop-blur-xl sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-indigo-600" />
              Detalle de Sesión #{sessionId}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? 'Cargando información...' : `Sesión de ${data?.session?.first_name} ${data?.session?.last_name}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-4 text-sm font-medium">Recuperando transacciones...</p>
             </div>
          ) : !data ? (
             <div className="p-10 text-center text-gray-500">No se encontraron datos para esta sesión.</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <MetricCard 
                    label="Total Entradas USD"
                    value={`$${(data.metrics.USD.cash + data.metrics.USD.zelle + data.metrics.USD.other).toFixed(2)}`}
                    subtext={`Efectivo: $${data.metrics.USD.cash.toFixed(2)}`}
                    color="emerald"
                 />
                 <MetricCard 
                    label="Total Entradas BS"
                    value={`Bs ${data.metrics.BS.cash + data.metrics.BS.mobile_payment + data.metrics.BS.transfer + data.metrics.BS.card}`}
                    subtext={`Efectivo: Bs. ${data.metrics.BS.cash}`}
                    color="indigo"
                 />
                 <MetricCard 
                    label="Cuentas Abiertas"
                    value={data.opened_accounts.length}
                    subtext="Nuevos pacientes atendidos"
                    color="blue"
                 />
                 <MetricCard 
                    label="Cuentas Anuladas"
                    value={data.cancelled_accounts.length}
                    subtext="Cancelaciones en el turno"
                    color="rose"
                 />
              </div>

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 
                 {/* Left Column: Movement History */}
                 <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 border-b pb-2">Historial de Movimientos</h3>
                    <div className="space-y-2">
                      {data.movements.length === 0 ? (
                        <p className="text-gray-400 text-sm italic">Sin movimientos registrados</p>
                      ) : data.movements.map((m, idx) => (
                        <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                           <div className="flex gap-3">
                              <div className={`mt-1 p-1.5 rounded-lg ${m.movement_type === 'reversal' ? 'bg-purple-100 text-purple-600' : m.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                 {m.movement_type === 'reversal' ? <AlertCircle className="w-4 h-4"/> : m.amount > 0 ? <ArrowUpCircle className="w-4 h-4"/> : <ArrowDownCircle className="w-4 h-4"/>}
                              </div>
                              <div>
                                 <div className="text-sm font-semibold text-gray-900">
                                   {m.payment_method ? formatPaymentMethod(m.payment_method) : m.description}
                                 </div>
                                 <div className="text-xs text-gray-500">
                                   {new Date(m.created_at).toLocaleTimeString()}
                                   {m.reference_number && ` • Ref: ${m.reference_number}`}
                                 </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className={`text-sm font-bold ${m.movement_type === 'reversal' ? 'text-purple-600' : 'text-gray-900'}`}>
                                 {m.amount} {m.currency}
                              </div>
                              <div className="text-[10px] text-gray-400 uppercase">{m.movement_type}</div>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* Right Column: Accounts Info */}
                 <div className="space-y-6">
                    
                    {/* Opened Accounts */}
                    <div className="space-y-3">
                       <h3 className="font-bold text-gray-900 border-b pb-2 flex justify-between">
                          <span>Aperturas de Cuenta</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{data.opened_accounts.length}</span>
                       </h3>
                       {data.opened_accounts.length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-gray-400 text-sm">
                             Sin cuentas nuevas en este turno
                          </div>
                       ) : data.opened_accounts.map(acc => (
                          <div key={acc.id} className="p-3 bg-blue-50/50 rounded-xl flex justify-between items-center">
                             <div>
                                <div className="text-sm font-bold text-gray-900">{acc.full_name}</div>
                                <div className="text-xs text-gray-500">Cuenta #{acc.id} • {acc.items_count} servicios</div>
                             </div>
                             <div className="text-right">
                                <div className="text-sm font-bold text-indigo-600">${Number(acc.total_usd).toFixed(2)}</div>
                                <div className="text-[10px] text-gray-400">{new Date(acc.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                             </div>
                          </div>
                       ))}
                    </div>

                    {/* Cancelled Accounts */}
                    {data.cancelled_accounts.length > 0 && (
                       <div className="space-y-3">
                          <h3 className="font-bold text-red-900 border-b border-red-100 pb-2 flex justify-between">
                             <span className="text-red-600">Cuentas Anuladas</span>
                             <span className="text-xs bg-red-100 px-2 py-1 rounded-full text-red-600">{data.cancelled_accounts.length}</span>
                          </h3>
                          {data.cancelled_accounts.map(acc => (
                             <div key={acc.id} className="p-3 bg-red-50 rounded-xl flex justify-between items-center opacity-75">
                                <div>
                                   <div className="text-sm font-bold text-red-900 strike-through decoration-red-500 line-through">{acc.full_name}</div>
                                   <div className="text-xs text-red-400">Anulada a las {new Date(acc.cancelled_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                </div>
                                <div className="text-sm font-bold text-red-300 line-through">
                                   ${Number(acc.total_usd).toFixed(2)}
                                </div>
                             </div>
                          ))}
                       </div>
                    )}

                 </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
           <div className="flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                 Cerrar Detalle
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ label, value, subtext, color }) {
   const colors = {
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      blue: 'bg-blue-50 text-blue-700 border-blue-100',
      rose: 'bg-rose-50 text-rose-700 border-rose-100'
   };
   
   return (
      <div className={`p-4 rounded-2xl border ${colors[color]}`}>
         <p className="text-xs font-bold uppercase opacity-70 mb-1">{label}</p>
         <p className="text-xl font-black tracking-tight">{value}</p>
         {subtext && <p className="text-[10px] opacity-80 mt-1 font-medium">{subtext}</p>}
      </div>
   )
}

function formatPaymentMethod(method) {
   const map = {
      cash_usd: 'Efectivo Divisa',
      cash_bs: 'Efectivo Bs',
      transfer_bs: 'Transferencia',
      mobile_payment_bs: 'Pago Móvil',
      zelle: 'Zelle'
   };
   return map[method] || method;
}
