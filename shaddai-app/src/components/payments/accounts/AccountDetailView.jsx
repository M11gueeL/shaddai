import React, { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  CreditCard, 
  Package, 
  Plus, 
  ArrowRight,
  DollarSign,
  FileText,
  HandCoins,
  CheckCircle2,
  ReceiptText
} from 'lucide-react';

import * as accountsApi from '../../../api/accounts';
import * as servicesApi from '../../../api/services';
import * as paymentsApi from '../../../api/payments';
import * as receiptsApi from '../../../api/receipts';
import * as inventoryApi from '../../../api/inventoryApi';

import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';

import { StatusBadge, HistoryIcon } from './utils';
import { TabBtn, ItemRow, EmptyState } from './ListComponents';

export default function AccountDetailView({ account, details, setDetails, onBack, onReload, rate, receiptInfo, token }) {
  const { confirm } = useConfirm();
  const toast = useToast();
  const [tab, setTab] = useState('services'); // services | payments | supplies
  const { hasRole } = useAuth();

  // Void Reason Modal State
  const [showVoidReason, setShowVoidReason] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  
  const PAYMENT_METHODS = {
    cash_bs: 'Bolívares en efectivo',
    cash_usd: 'Divisas en efectivo',
    transfer_bs: 'Transferencia en Bolívares',
    mobile_payment_bs: 'Pago Móvil'
  };

  // Loaders for selects
  const [servicesList, setServicesList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  
  // Form states
  const [serviceId, setServiceId] = useState('');
  const [serviceQty, setServiceQty] = useState(1);
  const [itemId, setItemId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  
  // Payment states
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash_bs');
  const [ref, setRef] = useState('');
  const [file, setFile] = useState(null);

  // Load lists
  useEffect(() => {
    servicesApi.listServices(token).then(r => setServicesList(r.data || [])).catch(()=>{});
    inventoryApi.listInventory({onlyActive:1}, token).then(r => setInventoryList(r.data?.filter(i=>i.is_active) || [])).catch(()=>{});
  }, [token]);

  // Calculations
  const canModify = !['paid', 'cancelled'].includes(account.status);
  
  const payments = account.payments || [];
  const validPayments = payments.filter(p => p.status !== 'rejected');
  const paidUsd = validPayments.reduce((acc, p) => acc + Number(p.amount_usd_equivalent || 0), 0);
  
  const totalUsd = Number(account.total_usd || 0);
  const totalBs = Number(account.total_bs || 0);
  const pendingUsd = Math.max(0, totalUsd - paidUsd);
  
  // Local estimated Bs pending
  const currentRate = Number(account.rate_bcv || rate || 0);
  const pendingBs = currentRate ? pendingUsd * currentRate : 0;

  // Actions
  const handleAddService = async () => {
    if(!serviceId) return;
    try {
      await accountsApi.addDetail(account.id, { service_id: serviceId, quantity: serviceQty }, token);
      toast.success('Servicio añadido');
      setServiceId(''); setServiceQty(1);
      onReload();
    } catch(e) { toast.error('Error al agregar servicio'); }
  };

  const handleAddSupply = async () => {
    if(!itemId) return;
    try {
      await accountsApi.addSupply(account.id, { item_id: itemId, quantity: itemQty }, token);
      toast.success('Insumo añadido');
      setItemId(''); setItemQty(1);
      onReload();
    } catch(e) { toast.error('Error al agregar insumo'); }
  };

  const removeItem = async (id, type) => {
    if(!await confirm({ title: 'Eliminar item', message: '¿Seguro que deseas eliminar este elemento?' })) return;
    try {
      if(type === 'service') await accountsApi.removeDetail(id, token);
      else await accountsApi.removeSupply(id, token);
      toast.success('Eliminado correctamente');
      onReload();
    } catch(e) { toast.error('Error al eliminar'); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if(!amount) return;
    
    // Validation
    const val = parseFloat(amount);
    
    // 1. Negative check
    if (val <= 0) return toast.warning('El monto debe ser positivo');

    // 2. Integer check for Cash
    if ((method === 'cash_usd' || method === 'cash_bs') && !Number.isInteger(val)) {
        return toast.warning('Los pagos en efectivo no pueden tener decimales');
    }

    // 3. Balance check
    if (method === 'cash_usd') {
       if(val > pendingUsd) return toast.warning('El monto excede el saldo pendiente en Divisas');
    } else {
       // if electronic or cash in Bs, check limits with small tolerance
       const maxBs = pendingBs + 0.5; 
       if(val > maxBs) return toast.warning('El monto excede el saldo pendiente en Bs');
    }

    const form = new FormData();
    form.append('payment_method', method);
    form.append('amount', val);
    form.append('currency', method === 'cash_usd' ? 'USD' : 'BS');
    if(ref) form.append('reference_number', ref);
    if(file) form.append('attachment', file);

    try {
      await paymentsApi.createPayment(account.id, form, token);
      toast.success('Pago registrado');
      setAmount(''); setRef(''); setFile(null);
      onReload();
    } catch(e) { toast.error('Error al registrar pago'); }
  };

  const handleReceipt = async () => {
    if(!receiptInfo) return;
    try {
      const r = await receiptsApi.downloadReceipt(receiptInfo.id, token);
      const blob = new Blob([r.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_${receiptInfo.receipt_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch(e) { toast.error('Error al descargar recibo'); }
  };

  const initiateVoidReceipt = () => {
    setVoidReason('');
    setShowVoidReason(true);
  };

  const confirmVoidReceipt = async () => {
    if(!voidReason.trim()) return toast.warning('Debe especificar un motivo para anular');
    if(!receiptInfo) return;
    
    // Final confirm
    if(!await confirm({ 
        title: 'ANULACIÓN PERMANENTE', 
        message: 'Esta acción anulará el recibo, el pago asociado y generará un reverso en caja. La cuenta se reabrirá para edición. ¿Proceder?' 
    })) return;

    try {
        await receiptsApi.annulReceipt(receiptInfo.id, voidReason, token);
        toast.success('Recibo anulado y cuenta reabierta exitosamente.');
        setShowVoidReason(false);
        onReload(); // Reload to update UI state
    } catch(e) {
        toast.error(e.response?.data?.error || 'Error al anular recibo');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6 animate-in slide-in-from-right duration-500">
      {/* Top Navigation */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Volver al listado
      </button>

      {/* Account Header Card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0" />
        
        <div className="relative z-10 p-6 sm:p-8">
           <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-gray-400">#{account.id}</span>
                  <StatusBadge status={account.status} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{account.patient_name}</h1>
                <p className="text-sm text-gray-500 mt-1">Responsable: <span className="font-medium text-gray-700">{account.payer_name}</span></p>
                
                {account.status === 'paid' && receiptInfo && (
                  <div className="flex gap-2 mt-4">
                      <button onClick={handleReceipt} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center gap-2">
                        <ReceiptText className="w-4 h-4" /> Descargar Recibo
                      </button>
                      
                      {/* Admin Void Button */}
                      {hasRole(['admin']) && (
                          <button onClick={initiateVoidReceipt} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors flex items-center gap-2">
                            <HandCoins className="w-4 h-4" /> Anular Recibo
                          </button>
                      )}
                  </div>
                )}
              </div>

              {/* Financial Summary */}
              <div className="flex gap-4 sm:gap-8 bg-gray-50/80 backdrop-blur p-4 rounded-2xl border border-gray-100">
                 <div className="text-right">
                    <div className="text-xs uppercase font-bold text-gray-400 mb-1">Total</div>
                    <div className="text-xl font-bold text-gray-900">${totalUsd.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Bs {totalBs.toFixed(2)}</div>
                 </div>
                 <div className="w-px bg-gray-200" />
                 <div className="text-right">
                    <div className="text-xs uppercase font-bold text-gray-400 mb-1">Pagado</div>
                    <div className="text-xl font-bold text-emerald-600">${paidUsd.toFixed(2)}</div>
                 </div>
                 <div className="w-px bg-gray-200" />
                 <div className="text-right">
                    <div className="text-xs uppercase font-bold text-gray-400 mb-1">Pendiente</div>
                    <div className="text-xl font-bold text-rose-600">${pendingUsd.toFixed(2)}</div>
                    <div className="text-xs text-rose-600/70 font-medium">~Bs {pendingBs.toFixed(2)}</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 sm:px-8">
           <div className="flex gap-6 overflow-x-auto">
             <TabBtn active={tab==='services'} onClick={()=>setTab('services')} icon={ClipboardList} label="Servicios" count={details.length} />
             <TabBtn active={tab==='supplies'} onClick={()=>setTab('supplies')} icon={Package} label="Insumos" count={account.supplies?.length || 0} />
             <TabBtn active={tab==='payments'} onClick={()=>setTab('payments')} icon={CreditCard} label="Pagos" count={validPayments.length} />
           </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
           {tab === 'services' && (
             <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <ClipboardList className="w-5 h-5 text-gray-400" /> Servicios Facturados
               </h3>
               {details.length === 0 ? (
                 <EmptyState label="No hay servicios agregados" />
               ) : (
                 <div className="space-y-2">
                   {details.map(d => (
                     <ItemRow 
                       key={d.id} 
                       title={d.service_name} 
                       qty={d.quantity} 
                       price={d.price_usd} 
                       total={d.price_usd * (d.quantity||1)} 
                       onDelete={canModify ? ()=>removeItem(d.id,'service') : null} 
                     />
                   ))}
                 </div>
               )}
               {canModify && (
                 <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex gap-3">
                       <select value={serviceId} onChange={(e)=>setServiceId(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-900/10 outline-none">
                          <option value="">Agregar servicio...</option>
                          {servicesList.map(s => <option key={s.id} value={s.id}>{s.name} (${Number(s.price_usd).toFixed(2)})</option>)}
                       </select>
                       <input type="number" min="1" value={serviceQty} onChange={(e)=>setServiceQty(e.target.value)} className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/10" />
                       <button onClick={handleAddService} disabled={!serviceId} className="px-5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                         <Plus className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
               )}
             </div>
           )}

           {tab === 'supplies' && (
             <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <Package className="w-5 h-5 text-gray-400" /> Insumos Médicos
               </h3>
               {!account.supplies?.length ? (
                 <EmptyState label="No hay insumos cargados" />
               ) : (
                 <div className="space-y-2">
                   {account.supplies.map(s => (
                     <ItemRow 
                       key={s.id} 
                       title={s.description || s.item_name} 
                       qty={s.quantity} 
                       price={s.price_usd} 
                       total={s.total_price_usd} 
                       onDelete={canModify ? ()=>removeItem(s.id,'supply') : null} 
                     />
                   ))}
                 </div>
               )}
               {canModify && (
                 <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex gap-3">
                       <select value={itemId} onChange={(e)=>setItemId(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-900/10 outline-none">
                          <option value="">Agregar insumo...</option>
                          {inventoryList.map(i => <option key={i.id} value={i.id}>{i.name} (Stock: {i.stock_quantity}) - ${Number(i.price_usd).toFixed(2)}</option>)}
                       </select>
                       <input type="number" min="1" value={itemQty} onChange={(e)=>setItemQty(e.target.value)} className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/10" />
                       <button onClick={handleAddSupply} disabled={!itemId} className="px-5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                         <Plus className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
               )}
             </div>
           )}

           {tab === 'payments' && (
             <div className="space-y-6">
                {/* Payments List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                   <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <HistoryIcon className="w-5 h-5 text-gray-400" /> Historial de Pagos
                   </h3>
                   {validPayments.length === 0 ? (
                      <EmptyState label="No se han registrado pagos" />
                   ) : (
                      <div className="space-y-3">
                        {validPayments.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                             <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white rounded-xl text-gray-600 shadow-sm">
                                   {p.payment_method?.includes('cash') ? <DollarSign className="w-5 h-5"/> : <CreditCard className="w-5 h-5"/>}
                                </div>
                                <div>
                                   <div className="font-semibold text-gray-900">
                                      {p.currency} {Number(p.amount).toFixed(2)}
                                   </div>
                                   <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                                      {PAYMENT_METHODS[p.payment_method] || p.payment_method}
                                   </div>
                                </div>
                             </div>
                             
                             <div className="flex flex-col items-end gap-1">
                                {p.status === 'verified' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">VERIFICADO</span>}
                                {p.status === 'pending' && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">PENDIENTE</span>}
                                <div className="text-xs text-gray-400">
                                   {p.currency === 'BS' ? `~ $${Number(p.amount_usd_equivalent).toFixed(2)}` : ''}
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                   )}
                </div>
             </div>
           )}
        </div>

        {/* Action Sidebar (Right 1/3) */}
        <div className="lg:col-span-1">
           {canModify ? (
             <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-6">
               <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
                 <HandCoins className="w-5 h-5 text-indigo-600" /> Registrar Pago
               </h3>
               
               <form onSubmit={handlePayment} className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Método</label>
                   <select value={method} onChange={(e)=>setMethod(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                      {Object.entries(PAYMENT_METHODS).map(([val, label]) => (
                         <option key={val} value={val}>{label}</option>
                      ))}
                   </select>
                 </div>

                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Monto ({method.includes('bs') ? 'Bs' : 'USD'})</label>
                   <div className="relative">
                      <input 
                        type="number" 
                        step="0.01" 
                        value={amount} 
                        onChange={(e)=>setAmount(e.target.value)} 
                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl pl-4 pr-12 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                        placeholder="0.00" 
                      />
                      <button type="button" onClick={() => setAmount(method.includes('usd') ? pendingUsd.toFixed(2) : pendingBs.toFixed(2))} className="absolute right-2 top-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition">Complete</button>
                   </div>
                   {method.includes('bs') && amount && (
                     <div className="text-right mt-1 text-xs text-gray-400">
                        ~ ${(Number(amount) / currentRate).toFixed(2)} USD
                     </div>
                   )}
                 </div>

                 {(method === 'transfer_bs' || method === 'mobile_payment_bs') && (
                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                       <input 
                         placeholder="Nro. Referencia" 
                         value={ref} 
                         onChange={(e)=>setRef(e.target.value)}
                         className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                       />
                       <div className="flex items-center gap-2 text-xs text-gray-400">
                         <input type="file" onChange={(e)=>setFile(e.target.files?.[0])} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors" />
                       </div>
                    </div>
                 )}

                 <button 
                  type="submit" 
                  disabled={!amount}
                  className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:translate-y-px"
                >
                   Procesar Pago
                 </button>
               </form>
             </div>
           ) : (
             <div className="bg-gray-50 rounded-[2rem] p-8 text-center border border-dashed border-gray-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-gray-900 font-bold mb-1">Cuenta Cerrada</h3>
                <p className="text-sm text-gray-500">No se pueden realizar más modificaciones en esta cuenta.</p>
             </div>
           )}
        </div>

      </div>
      {/* Modal de Motivo de Anulación */}
      {showVoidReason && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full animate-in zoom-in-95 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-rose-600">Anular Recibo</h3>
            <p className="text-sm text-gray-500 mb-4">
               Ingrese el motivo de la anulación. Esta acción quedará registrada en auditoría y reabrirá la cuenta para correcciones.
            </p>
            <textarea
              value={voidReason}
              onChange={e => setVoidReason(e.target.value)}
              className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none"
              placeholder="Ej: Error en el cobro del servicio X..."
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowVoidReason(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmVoidReceipt}
                className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-medium shadow-lg shadow-rose-200 transition-colors"
              >
                Confirmar Anulación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
