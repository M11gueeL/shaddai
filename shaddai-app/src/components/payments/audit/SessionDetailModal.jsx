// src/components/payments/audit/SessionDetailModal.jsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  AlertCircle,
   CheckCircle2,
   AlertTriangle,
  FileText
} from 'lucide-react';
import * as cashApi from '../../../api/cashregister';

export default function SessionDetailModal({ sessionId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async () => {
    try {
        setDownloading(true);
        const response = await cashApi.downloadSessionReport(sessionId);
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
        setDownloading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    cashApi.getSessionDetails(sessionId)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (!sessionId) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl backdrop-blur-xl sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-indigo-600" />
              Detalle de Sesión #{sessionId}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
                     {loading ? 'Cargando información...' : `Sesión de ${data?.session?.first_name || ''} ${data?.session?.last_name || ''}`}
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
              <SessionReconciliationSummary session={data.session} />

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <MetricCard 
                    label="Ingresos USD"
                    value={`$${(data.metrics.USD.cash + data.metrics.USD.zelle + data.metrics.USD.other).toFixed(2)}`}
                    subtext={`En caja: $${data.metrics.USD.cash.toFixed(2)}`}
                    color="emerald"
                 />
                 <MetricCard 
                    label="Efectivo BS"
                    value={`Bs ${data.metrics.BS.cash.toFixed(2)}`}
                    subtext="En caja física"
                    color="indigo"
                 />
                 <MetricCard 
                    label="Transferencias BS"
                    value={`Bs ${data.metrics.BS.transfer.toFixed(2)}`}
                    subtext="Bancos nacionales"
                    color="blue"
                 />
                 <MetricCard 
                    label="Pago Móvil BS"
                    value={`Bs ${data.metrics.BS.mobile_payment.toFixed(2)}`}
                    subtext="Pagos móviles recibidos"
                    color="purple"
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
                        <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-3">
                           <div className="flex gap-3">
                              <div className={`mt-1 p-1.5 rounded-lg ${movementTypeStyle(m.movement_type).iconClass}`}>
                                 {movementTypeStyle(m.movement_type).icon === 'in' ? <ArrowUpCircle className="w-4 h-4"/> : movementTypeStyle(m.movement_type).icon === 'out' ? <ArrowDownCircle className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                              </div>
                              <div>
                                 <div className="text-sm font-semibold text-gray-900">
                                   {translateMovementType(m.movement_type)}
                                 </div>
                                 <div className="text-xs text-gray-500 mt-0.5">
                                    {m.description || 'Sin descripción'}
                                 </div>
                                 <div className="text-[11px] text-gray-400 mt-1">
                                    {formatDateTime(m.created_at)}
                                    {m.payment_method && ` • ${formatPaymentMethod(m.payment_method)}`}
                                    {m.reference_number && ` • Ref: ${m.reference_number}`}
                                    {m.account_id && ` • Cuenta #${m.account_id}`}
                                 </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className={`text-sm font-bold ${movementTypeStyle(m.movement_type).amountClass}`}>
                                 {formatSignedAmount(m.amount, m.currency, movementTypeStyle(m.movement_type).icon)}
                              </div>
                              <div className={`text-[10px] uppercase font-bold ${movementTypeStyle(m.movement_type).tagClass}`}>
                                 {movementTypeStyle(m.movement_type).tag}
                              </div>
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

                    {/* Billed Accounts */}
                    <div className="space-y-3">
                       <h3 className="font-bold text-gray-900 border-b pb-2 flex justify-between">
                          <span>Cuentas Facturadas</span>
                          <span className="text-xs bg-emerald-100 px-2 py-1 rounded-full text-emerald-700">{(data.billed_accounts || []).length}</span>
                       </h3>
                       {(data.billed_accounts || []).length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-gray-400 text-sm">
                             Sin cuentas cobradas en este turno
                          </div>
                       ) : (data.billed_accounts || []).map(acc => (
                          <div key={acc.id} className="p-3 bg-emerald-50/70 rounded-xl flex justify-between items-center">
                             <div>
                                <div className="text-sm font-bold text-gray-900">{acc.full_name}</div>
                                <div className="text-xs text-gray-500">Cuenta #{acc.id} • {acc.payments_count} pagos</div>
                             </div>
                             <div className="text-right">
                                <div className="text-sm font-bold text-emerald-700">${Number(acc.collected_usd || 0).toFixed(2)} / Bs {Number(acc.collected_bs || 0).toFixed(2)}</div>
                                <div className="text-[10px] text-gray-400">{acc.last_payment_at ? new Date(acc.last_payment_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '-'}</div>
                             </div>
                          </div>
                       ))}
                    </div>

                    {/* Cancelled Accounts */}
                    {data.cancelled_accounts.length > 0 && (
                       <div className="space-y-3">
                          <h3 className="font-bold text-red-900 border-b border-red-100 pb-2 flex justify-between">
                             <span className="text-red-600">Cuentas Canceladas</span>
                             <span className="text-xs bg-red-100 px-2 py-1 rounded-full text-red-600">{data.cancelled_accounts.length}</span>
                          </h3>
                          {data.cancelled_accounts.map(acc => (
                             <div key={acc.id} className="p-3 bg-red-50 rounded-xl flex justify-between items-center opacity-75">
                                <div>
                                   <div className="text-sm font-bold text-red-900 strike-through decoration-red-500 line-through">{acc.full_name}</div>
                                   <div className="text-xs text-red-400">Cancelada a las {new Date(acc.cancelled_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
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
           <div className="flex justify-between items-center w-full">
              <div className="text-xs text-gray-400 font-mono">
              ID: {sessionId} • Apertura: {formatDateTime(data?.session?.start_time)}
              </div>
              <div className="flex gap-3">
                  {data?.session?.status !== 'open' && (
                    <button 
                        onClick={handleDownloadReport}
                        disabled={downloading}
                        className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileText className="w-4 h-4" />
                        {downloading ? 'Generando...' : 'Descargar Reporte'}
                    </button>
                  )}
                  <button 
                    onClick={onClose}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                  >
                     Cerrar
                  </button>
              </div>
           </div>
        </div>

      </div>
    </div>,
    document.body
  );
}

function SessionReconciliationSummary({ session }) {
   const diffUsd = Number(session?.difference_usd || 0);
   const diffBs = Number(session?.difference_bs || 0);
   const declaredUsd = session?.real_end_balance_usd;
   const declaredBs = session?.real_end_balance_bs;
   const calculatedUsd = session?.calculated_end_balance_usd;
   const calculatedBs = session?.calculated_end_balance_bs;

   const hasDiff = Math.abs(diffUsd) >= 0.01 || Math.abs(diffBs) >= 0.01;
   const hasShortage = diffUsd < -0.009 || diffBs < -0.009;

   const state = session?.status === 'open'
      ? {
            label: 'Sesión abierta',
            message: 'La sesión sigue activa y aún no tiene arqueo final.',
            className: 'bg-blue-50 border-blue-200 text-blue-700',
            icon: AlertCircle
         }
      : !hasDiff
         ? {
               label: 'Caja cuadrada',
               message: 'No hay diferencias entre lo esperado y lo declarado.',
               className: 'bg-emerald-50 border-emerald-200 text-emerald-700',
               icon: CheckCircle2
            }
         : hasShortage
            ? {
                  label: 'Faltante detectado',
                  message: 'Existe diferencia negativa en el arqueo de caja.',
                  className: 'bg-red-50 border-red-200 text-red-700',
                  icon: AlertTriangle
               }
            : {
                  label: 'Sobrante detectado',
                  message: 'Existe diferencia positiva en el arqueo de caja.',
                  className: 'bg-amber-50 border-amber-200 text-amber-700',
                  icon: AlertTriangle
               };

   const StateIcon = state.icon;

   return (
      <div className="space-y-4">
         <div className={`rounded-2xl border p-4 ${state.className}`}>
            <div className="flex items-start gap-3">
               <StateIcon className="w-5 h-5 mt-0.5" />
               <div>
                  <h3 className="font-bold">{state.label}</h3>
                  <p className="text-sm mt-1">{state.message}</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
               <p className="text-[11px] uppercase font-bold text-gray-500">Resumen de sesión</p>
               <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Estado</span><span className="font-semibold text-gray-900">{session?.status === 'open' ? 'Abierta' : 'Cerrada'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Apertura</span><span className="font-semibold text-gray-900">{formatDateTime(session?.start_time)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Cierre</span><span className="font-semibold text-gray-900">{formatDateTime(session?.end_time)}</span></div>
               </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
               <p className="text-[11px] uppercase font-bold text-gray-500">Conciliación USD</p>
               <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Inicial</span><span className="font-semibold text-gray-900">{formatMoney(session?.start_balance_usd, 'USD')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Esperado</span><span className="font-semibold text-gray-900">{formatMoney(calculatedUsd, 'USD', '-')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Declarado</span><span className="font-semibold text-gray-900">{formatMoney(declaredUsd, 'USD', '-')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Diferencia</span><span className={`font-semibold ${diffUsd < 0 ? 'text-red-600' : diffUsd > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{formatSignedMoney(diffUsd, 'USD')}</span></div>
               </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
               <p className="text-[11px] uppercase font-bold text-gray-500">Conciliación BS</p>
               <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Inicial</span><span className="font-semibold text-gray-900">{formatMoney(session?.start_balance_bs, 'BS')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Esperado</span><span className="font-semibold text-gray-900">{formatMoney(calculatedBs, 'BS', '-')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Declarado</span><span className="font-semibold text-gray-900">{formatMoney(declaredBs, 'BS', '-')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Diferencia</span><span className={`font-semibold ${diffBs < 0 ? 'text-red-600' : diffBs > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{formatSignedMoney(diffBs, 'BS')}</span></div>
               </div>
            </div>
         </div>

         <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <p className="text-[11px] uppercase font-bold text-gray-500 mb-2">Observaciones de cierre</p>
            <p className="text-sm text-gray-700">{session?.notes?.trim() ? session.notes : 'Sin observaciones registradas.'}</p>
         </div>
      </div>
   );
}

function MetricCard({ label, value, subtext, color }) {
   const colors = {
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      blue: 'bg-blue-50 text-blue-700 border-blue-100',
      rose: 'bg-rose-50 text-rose-700 border-rose-100',
      amber: 'bg-amber-50 text-amber-700 border-amber-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-100',
   };
   
   return (
      <div className={`p-4 rounded-2xl border ${colors[color]}`}>
         <p className="text-xs font-bold uppercase opacity-70 mb-1">{label}</p>
         <p className="text-xl font-bold tracking-tight">{value}</p>
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
   return map[method] || 'Método no especificado';
}

function translateMovementType(type) {
   const map = {
      payment_in: 'Ingreso por cobro',
      payment_out: 'Egreso por pago',
      expense_out: 'Gasto / Salida de caja',
      adjustment_in: 'Ajuste de entrada',
      adjustment_out: 'Ajuste de salida',
      reversal: 'Reverso de operación',
      initial_balance: 'Fondo inicial'
   };
   return map[type] || 'Movimiento de caja';
}

function movementTypeStyle(type) {
   const map = {
      payment_in: {
         icon: 'in',
         iconClass: 'bg-emerald-100 text-emerald-600',
         amountClass: 'text-emerald-700',
         tagClass: 'text-emerald-700',
         tag: 'Ingreso'
      },
      adjustment_in: {
         icon: 'in',
         iconClass: 'bg-emerald-100 text-emerald-600',
         amountClass: 'text-emerald-700',
         tagClass: 'text-emerald-700',
         tag: 'Ajuste'
      },
      expense_out: {
         icon: 'out',
         iconClass: 'bg-red-100 text-red-600',
         amountClass: 'text-red-700',
         tagClass: 'text-red-700',
         tag: 'Egreso'
      },
      adjustment_out: {
         icon: 'out',
         iconClass: 'bg-red-100 text-red-600',
         amountClass: 'text-red-700',
         tagClass: 'text-red-700',
         tag: 'Ajuste'
      },
      payment_out: {
         icon: 'out',
         iconClass: 'bg-red-100 text-red-600',
         amountClass: 'text-red-700',
         tagClass: 'text-red-700',
         tag: 'Egreso'
      },
      reversal: {
         icon: 'neutral',
         iconClass: 'bg-purple-100 text-purple-600',
         amountClass: 'text-purple-700',
         tagClass: 'text-purple-700',
         tag: 'Reverso'
      },
      initial_balance: {
         icon: 'in',
         iconClass: 'bg-blue-100 text-blue-600',
         amountClass: 'text-blue-700',
         tagClass: 'text-blue-700',
         tag: 'Inicial'
      }
   };

   return map[type] || {
      icon: 'neutral',
      iconClass: 'bg-gray-100 text-gray-600',
      amountClass: 'text-gray-700',
      tagClass: 'text-gray-600',
      tag: 'Movimiento'
   };
}

function formatSignedAmount(amount, currency, direction) {
   const n = Number(amount || 0);
   const abs = Math.abs(n).toFixed(2);
   const symbol = currency === 'USD' ? '$' : 'Bs ';
   const sign = direction === 'out' ? '-' : direction === 'in' ? '+' : '';
   return `${sign}${symbol}${abs}`;
}

function formatDateTime(value) {
   if (!value) return '-';
   const normalized = typeof value === 'string' && value.includes(' ') && !value.includes('T') ? value.replace(' ', 'T') : value;
   const date = new Date(normalized);
   if (Number.isNaN(date.getTime())) return String(value);
   return date.toLocaleString('es-VE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
   });
}

function formatMoney(value, currency, fallback = '0.00') {
   if (value === null || value === undefined || value === '') {
      return fallback === '-' ? '-' : `${currency === 'USD' ? '$' : 'Bs '}${fallback}`;
   }
   const n = Number(value || 0);
   return `${currency === 'USD' ? '$' : 'Bs '}${n.toFixed(2)}`;
}

function formatSignedMoney(value, currency) {
   const n = Number(value || 0);
   const sign = n > 0 ? '+' : '';
   return `${currency === 'USD' ? '$' : 'Bs '}${sign}${n.toFixed(2)}`;
}
