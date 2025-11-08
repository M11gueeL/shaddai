import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as accountsApi from '../../api/accounts';
import * as servicesApi from '../../api/services';
import * as paymentsApi from '../../api/payments';
import * as ratesApi from '../../api/rates';
import * as inventoryApi from '../../api/inventoryApi';
import PatientsApi from '../../api/PatientsApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

function StatusBadge({ status }){
  const map = {
    pending: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700' },
    partially_paid: { label: 'Parcial', cls: 'bg-blue-100 text-blue-700' },
    paid: { label: 'Pagada', cls: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: 'Anulada', cls: 'bg-gray-100 text-gray-700' }
  };
  const m = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-1 rounded text-xs ${m.cls}`}>{m.label}</span>;
}

export default function AccountsWorkspace(){
  const detailsRef = useRef(null);
  const { token } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [payerQuery, setPayerQuery] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [payerResults, setPayerResults] = useState([]);
  const [chosenPatient, setChosenPatient] = useState(null);
  const [chosenPayer, setChosenPayer] = useState(null);

  const [method, setMethod] = useState('cash_bs');
  const [amount, setAmount] = useState('');
  const [ref, setRef] = useState('');
  const [file, setFile] = useState(null);
  const [rate, setRate] = useState(null);
  const [serviceToAdd, setServiceToAdd] = useState('');
  const [serviceQty, setServiceQty] = useState(1);
  const [stage, setStage] = useState('services'); // 'services' | 'payments' | 'supplies'
  const [supplies, setSupplies] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [supplyToAdd, setSupplyToAdd] = useState('');
  const [supplyQty, setSupplyQty] = useState(1);

  const load = async()=>{
    try{
      setLoading(true);
      const [accRes, srvRes, invRes] = await Promise.all([
        accountsApi.listAccounts(statusFilter ? { status: statusFilter } : undefined, token),
        servicesApi.listServices(token),
        inventoryApi.listInventory({ onlyActive: 1 }, token)
      ]);
      setAccounts(accRes.data || []);
      setServices(srvRes.data || []);
      setInventory((invRes.data || []).filter(i=>i.is_active===1 || i.is_active===true));
    }catch(e){
      toast.error('No se pudo cargar');
    }finally{ setLoading(false); }
  };

  const loadDetails = async(accountId, opts = { scroll: false })=>{
    try{
      const res = await accountsApi.getAccount(accountId, token);
      setSelected(res.data || null);
      setDetails((res.data && res.data.details) ? res.data.details : []);
      setSupplies(Array.isArray(res?.data?.supplies) ? res.data.supplies : []);
      // set account rate if provided
      if(res?.data?.rate_bcv){ setRate(Number(res.data.rate_bcv)); }
      // scroll if requested (used only when seleccionando cuenta)
      if(opts?.scroll){ setTimeout(()=>{ detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); }
    }catch(e){ setDetails([]); setSelected(null); }
  };

  const handleSelectAccount = async (accountId)=>{
    setStage('services');
    await loadDetails(accountId, { scroll: true });
  };

  // carga inicial y por filtro de estado
  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);
  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[statusFilter]);
  // tasa del día como respaldo si la cuenta no la trae
  useEffect(()=>{
    (async ()=>{
      try{ const r = await ratesApi.getTodayRate(token); setRate(Number(r?.data?.rate_bcv || r?.data?.rate || 0)); }catch{/* ignore */}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Derivados para UI
  const filteredAccounts = useMemo(()=>{
    const q = query.trim().toLowerCase();
    if(!q) return accounts;
    return accounts.filter(acc => {
      const text = `${acc.id} ${acc.patient_name || ''} ${acc.payer_name || ''}`.toLowerCase();
      return text.includes(q);
    });
  },[accounts, query]);

  const canModify = useMemo(()=> selected && selected.status !== 'paid' && selected.status !== 'cancelled', [selected]);
  const paidUsd = useMemo(()=>{
    const list = Array.isArray(selected?.payments) ? selected.payments : [];
    return list.filter(p=>p.status !== 'rejected').reduce((s,p)=> s + Number(p.amount_usd_equivalent||0), 0);
  }, [selected]);
  const accountTotalUsd = useMemo(()=> Number(selected?.total_usd || 0), [selected]);
  const saldoUsd = useMemo(()=> Math.max(0, accountTotalUsd - paidUsd), [accountTotalUsd, paidUsd]);
  // Usar totales consolidados que vienen de la cuenta (servicios + insumos)
  const totalUsd = useMemo(()=> Number(selected?.total_usd || 0), [selected]);
  const totalBs = useMemo(()=> Number(selected?.total_bs || 0), [selected]);
  const saldoBs = useMemo(()=>{
    const r = Number(selected?.rate_bcv || rate || 0);
    if(!r) return 0;
    const totalBsLocal = Number(selected?.total_bs || totalBs || 0);
    const paidBsApprox = paidUsd * r;
    return Math.max(0, totalBsLocal - paidBsApprox);
  }, [selected, totalBs, paidUsd, rate]);

  // Actions
  const addService = async (serviceId, qty = 1) => {
    if(!selected) return toast.warning('Selecciona una cuenta');
    if(!canModify) return toast.warning('La cuenta está pagada o anulada');
    try{
      await accountsApi.addDetail(selected.id, { service_id: serviceId, quantity: qty }, token);
      toast.success('Servicio agregado');
      loadDetails(selected.id);
    }catch(e){
      toast.error(e?.response?.data?.error || 'No se pudo agregar');
    }
  };

  const addSupply = async (itemId, qty = 1) => {
    if(!selected) return toast.warning('Selecciona una cuenta');
    if(!canModify) return toast.warning('La cuenta está pagada o anulada');
    try{
      await accountsApi.addSupply(selected.id, { item_id: itemId, quantity: qty }, token);
      toast.success('Insumo agregado');
      setSupplyToAdd(''); setSupplyQty(1);
      loadDetails(selected.id);
    }catch(e){
      toast.error(e?.response?.data?.error || 'No se pudo agregar el insumo');
    }
  };

  const removeDetail = async (detailId) => {
    if(!selected) return;
    const ok = await confirm({ title: 'Eliminar detalle', description: '¿Deseas quitar este servicio de la cuenta?' });
    if(!ok) return;
    try{
      await accountsApi.removeDetail(detailId, token);
      toast.success('Detalle eliminado');
      loadDetails(selected.id);
    }catch(e){
      toast.error(e?.response?.data?.error || 'No se pudo eliminar');
    }
  };

  const removeSupply = async (supplyId) => {
    if(!selected) return;
    const ok = await confirm({ title: 'Eliminar insumo', description: '¿Deseas quitar este insumo de la cuenta?' });
    if(!ok) return;
    try{
      await accountsApi.removeSupply(supplyId, token);
      toast.success('Insumo eliminado');
      loadDetails(selected.id);
    }catch(e){
      toast.error(e?.response?.data?.error || 'No se pudo eliminar');
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if(!selected) return toast.warning('Selecciona una cuenta');
    if(!canModify) return toast.warning('La cuenta está pagada o anulada');
    const a = parseFloat(amount);
    if(!a || a<=0) return toast.warning('Monto inválido');
    const currency = method === 'cash_usd' ? 'USD' : 'BS';
    if((method==='transfer_bs' || method==='mobile_payment_bs') && !file){
      return toast.warning('Debe adjuntar comprobante para transferencias o pago móvil');
    }
    const form = new FormData();
    form.append('payment_method', method);
    form.append('amount', a);
    form.append('currency', currency);
    if(ref) form.append('reference_number', ref);
    if(file) form.append('attachment', file);
    try{
      const res = await paymentsApi.createPayment(selected.id, form, token);
      if(res?.data?.id){
        toast.success('Pago registrado');
        setAmount(''); setRef(''); setFile(null);
        loadDetails(selected.id);
      } else {
        toast.error('La API no confirmó el pago');
      }
    }catch(e){
      toast.error(e?.response?.data?.error || 'No se pudo registrar el pago');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Cuentas de Cobro</h2>
          <p className="text-sm text-gray-600">Busca, crea y gestiona cuentas; al seleccionar una, verás sus detalles completos más abajo.</p>
        </div>
        <button onClick={()=>{ setCreateOpen(true); setChosenPatient(null); setChosenPayer(null); setPatientQuery(''); setPayerQuery(''); setPatientResults([]); setPayerResults([]); }} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm shadow-sm hover:shadow transition">
          Nueva cuenta
        </button>
      </div>

      {/* Listado de cuentas - Primera sección */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="font-medium">Cuentas</div>
          <div className="flex gap-2">
            <input value={query} onChange={(e)=>setQuery(e.target.value)} className="w-full md:w-80 border rounded-lg px-3 py-2 text-sm" placeholder="Buscar por #, paciente o pagador" />
            <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="border rounded-lg px-2 py-2 text-sm">
              <option value="">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="partially_paid">Parciales</option>
              <option value="paid">Pagadas</option>
              <option value="cancelled">Anuladas</option>
            </select>
            <button onClick={()=>{ setCreateOpen(true); setChosenPatient(null); setChosenPayer(null); setPatientQuery(''); setPayerQuery(''); setPatientResults([]); setPayerResults([]); }} className="sm:hidden px-3 py-2 rounded-lg bg-gray-900 text-white text-sm">Nueva cuenta</button>
          </div>
        </div>

        <div className="mt-3 divide-y rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="h-28 bg-gray-50 animate-pulse" />
          ) : filteredAccounts.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Sin cuentas</div>
          ) : filteredAccounts.map(acc => (
            <button
              key={acc.id}
              onClick={()=>handleSelectAccount(acc.id)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${selected?.id===acc.id?'bg-gray-50':''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">#{acc.id} - {acc.patient_name}</div>
                  <div className="text-xs text-gray-500">{acc.created_at}</div>
                </div>
                <StatusBadge status={acc.status} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detalles de cuenta - Segunda sección, aparece debajo */}
      {selected && (
        <div ref={detailsRef} className="mt-6">
          <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-80">Cuenta #{selected.id}</div>
                  <div className="text-base font-semibold">Paciente: {selected.patient_name} · Pagador: {selected.payer_name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/10 rounded-lg px-2 py-1 text-xs">
                    <StatusBadge status={selected.status} />
                  </div>
                  <button
                    onClick={()=>{ setSelected(null); setDetails([]); }}
                    className="px-2 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/20 transition"
                    title="Ocultar detalles"
                  >Ocultar</button>
                </div>
              </div>
              <div className="mt-2 text-xs text-white/80">Total: USD {Number(totalUsd).toFixed(2)} · Bs {Number(totalBs).toFixed(2)} · Pagado (USD): {paidUsd.toFixed(2)} · Saldo (USD): {saldoUsd.toFixed(2)} · Saldo (Bs): {saldoBs.toFixed(2)}</div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <button onClick={()=>setStage('services')} className={`px-3 py-1.5 rounded-lg text-sm border transition ${stage==='services'?'bg-gray-900 text-white border-gray-900':'bg-white text-gray-700 hover:bg-gray-50'}`}>Servicios</button>
                <button onClick={()=>setStage('payments')} className={`px-3 py-1.5 rounded-lg text-sm border transition ${stage==='payments'?'bg-gray-900 text-white border-gray-900':'bg-white text-gray-700 hover:bg-gray-50'}`}>Registrar pagos</button>
                <button onClick={()=>setStage('supplies')} className={`px-3 py-1.5 rounded-lg text-sm border transition ${stage==='supplies'?'bg-gray-900 text-white border-gray-900':'bg-white text-gray-700 hover:bg-gray-50'}`}>Insumos</button>
              </div>

              {stage==='services' ? (
                <div className="mt-4">
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    {details.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">Sin servicios</div>
                    ) : details.map(d => (
                      <div key={d.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                        <div>
                          <div className="font-medium text-sm">{d.service_name}</div>
                          <div className="text-xs text-gray-500">x{d.quantity || 1} · USD {Number(d.price_usd||0).toFixed(2)} · Bs {Number(d.price_bs||0).toFixed(2)}</div>
                        </div>
                        {canModify && (
                          <button onClick={()=>removeDetail(d.id)} className="text-xs text-red-600 hover:underline">Quitar</button>
                        )}
                      </div>
                    ))}
                    {!canModify && (
                      <div className="p-3 text-xs text-gray-600 bg-gray-50">Cuenta pagada/anulada: no se puede editar</div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-800 mb-2">Agregar servicio</div>
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                      <div className="flex-1">
                        <select disabled={!canModify} value={serviceToAdd} onChange={(e)=>setServiceToAdd(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm disabled:opacity-50">
                          <option value="">Selecciona un servicio…</option>
                          {services.map(s=> (
                            <option key={s.id} value={s.id}>{s.name} · USD {Number(s.price_usd||0).toFixed(2)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input disabled={!canModify} type="number" min="1" value={serviceQty} onChange={(e)=>setServiceQty(Math.max(1, parseInt(e.target.value||'1',10)))} className="w-24 border rounded-lg px-3 py-2 text-sm disabled:opacity-50" placeholder="Cantidad" />
                      </div>
                      <div>
                        <button disabled={!canModify || !serviceToAdd} onClick={()=>{ addService(Number(serviceToAdd), Number(serviceQty)); }} className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm disabled:opacity-50 shadow-sm hover:shadow">Agregar</button>
                      </div>
                      <div className="sm:ml-auto">
                        <button onClick={()=>setStage('payments')} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">Registrar pagos</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : stage==='payments' ? (
                <div className="mt-4 grid gap-4 md:grid-cols-5">
                  <div className="md:col-span-3">
                    <div className="text-sm font-medium text-gray-800 mb-2">Pagos registrados</div>
                    <div className="rounded-xl border border-gray-200 divide-y max-h-64 overflow-y-auto">
                      {(!selected?.payments || selected.payments.length===0) ? (
                        <div className="p-3 text-sm text-gray-500">Aún no hay pagos</div>
                      ) : selected.payments.map(p => (
                        <div key={p.id} className="p-3 text-sm flex items-center justify-between">
                          <div>
                            <div className="font-medium">{p.payment_method} · {p.currency} {Number(p.amount||0).toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Eq. USD {Number(p.amount_usd_equivalent||0).toFixed(2)} · {p.status}</div>
                          </div>
                          {p.reference_number && (
                            <div className="text-[11px] text-gray-500">Ref: {p.reference_number}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium text-gray-800 mb-2">Registrar pago</div>
                    <form onSubmit={submitPayment} className="space-y-2">
                      <select disabled={!canModify} value={method} onChange={(e)=>setMethod(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm disabled:opacity-50">
                        <option value="cash_bs">Efectivo Bs</option>
                        <option value="cash_usd">Divisas (efectivo)</option>
                        <option value="transfer_bs">Transferencia</option>
                        <option value="mobile_payment_bs">Pago móvil</option>
                      </select>
                      <input disabled={!canModify} type="number" step="0.01" min="0" className="w-full border rounded-lg px-3 py-2 text-sm disabled:opacity-50" placeholder="Monto" value={amount} onChange={(e)=>setAmount(e.target.value)} />
                      {(method==='transfer_bs' || method==='mobile_payment_bs') && (
                        <input disabled={!canModify} type="text" className="w-full border rounded-lg px-3 py-2 text-sm disabled:opacity-50" placeholder="Referencia" value={ref} onChange={(e)=>setRef(e.target.value)} />
                      )}
                      {(method==='transfer_bs' || method==='mobile_payment_bs') && (
                        <input disabled={!canModify} type="file" accept="image/*,.pdf" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="w-full text-sm disabled:opacity-50" />
                      )}
                      <div className="text-xs text-gray-500">Total: USD {totalUsd.toFixed(2)} · Bs {totalBs.toFixed(2)} · Saldo (USD): {saldoUsd.toFixed(2)} · Saldo (Bs): {saldoBs.toFixed(2)}</div>
                      <div className="flex justify-between items-center">
                        <button type="button" onClick={()=>setStage('services')} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">Volver a servicios</button>
                        <button disabled={!canModify} className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm disabled:opacity-50 shadow-sm hover:shadow">Guardar pago</button>
                      </div>
                      {!canModify && (
                        <div className="text-[11px] text-gray-500 mt-1">Cuenta pagada/anulada: no se permiten nuevos pagos.</div>
                      )}
                    </form>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-800 mb-2">Agregar insumo</div>
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                    <div className="flex-1">
                      <select disabled={!canModify} value={supplyToAdd} onChange={(e)=>setSupplyToAdd(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm disabled:opacity-50">
                        <option value="">Selecciona un insumo…</option>
                        {inventory.map(it => {
                          const usd = Number(it.price_usd||0);
                          const r = Number(selected?.rate_bcv || rate || 0);
                          const bs = r ? (usd * r) : 0;
                          return (
                            <option key={it.id} value={it.id}>{it.name} · USD {usd.toFixed(2)} · Bs {bs.toFixed(2)} · Stock {it.stock_quantity} {it.unit_of_measure||''}</option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <input disabled={!canModify} type="number" min="1" value={supplyQty} onChange={(e)=>setSupplyQty(Math.max(1, parseInt(e.target.value||'1',10)))} className="w-24 border rounded-lg px-3 py-2 text-sm disabled:opacity-50" placeholder="Cantidad" />
                    </div>
                    <div>
                      <button disabled={!canModify || !supplyToAdd} onClick={()=>{ addSupply(Number(supplyToAdd), Number(supplyQty)); }} className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm disabled:opacity-50 shadow-sm hover:shadow">Agregar insumo</button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
                    {(!supplies || supplies.length===0) ? (
                      <div className="p-4 text-sm text-gray-500">Sin insumos</div>
                    ) : supplies.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                        <div>
                          <div className="font-medium text-sm">{s.description}</div>
                          <div className="text-xs text-gray-500">x{s.quantity || 1} · USD {Number(s.total_price_usd ?? (s.price_usd * s.quantity)).toFixed(2)} · Bs {Number(s.total_price_bs ?? (s.price_bs * s.quantity)).toFixed(2)}</div>
                        </div>
                        {canModify && (
                          <button onClick={()=>removeSupply(s.id)} className="text-xs text-red-600 hover:underline">Quitar</button>
                        )}
                      </div>
                    ))}
                    {!canModify && (
                      <div className="p-3 text-xs text-gray-600 bg-gray-50">Cuenta pagada/anulada: no se puede editar</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {createOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={()=>setCreateOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-3">
              <div className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-900 text-white">Nueva cuenta</div>
              <button onClick={()=>setCreateOpen(false)} className="ml-auto p-1 rounded hover:bg-black/5">
                <span className="text-gray-500">✕</span>
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-gray-800 mb-1">Paciente</div>
                {chosenPatient ? (
                  <div className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                    <div>{chosenPatient.full_name} · CI {chosenPatient.cedula}</div>
                    <button onClick={()=>setChosenPatient(null)} className="text-xs text-blue-600 hover:underline">Cambiar</button>
                  </div>
                ) : (
                  <>
                    <input value={patientQuery} onChange={async (e)=>{
                      const val = e.target.value; setPatientQuery(val);
                      if(val.trim().length < 2){ setPatientResults([]); return; }
                      try { const r = await PatientsApi.search({ q: val, limit: 8 }, token); setPatientResults(r.data || []); } catch { setPatientResults([]); }
                    }} placeholder="Buscar por nombre o cédula" className="w-full border rounded px-3 py-2 text-sm" />
                    <div className="mt-2 max-h-40 overflow-y-auto divide-y border rounded">
                      {(patientResults||[]).length === 0 ? (
                        <div className="p-3 text-xs text-gray-500">Sin resultados</div>
                      ) : patientResults.map(p => (
                        <button key={p.id} onClick={()=>{ setChosenPatient(p); setPatientResults([]); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">
                          <div className="font-medium text-sm">{p.full_name}</div>
                          <div className="text-xs text-gray-500">CI {p.cedula}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800 mb-1">Pagador</div>
                {chosenPayer ? (
                  <div className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                    <div>{chosenPayer.full_name} · CI {chosenPayer.cedula}</div>
                    <button onClick={()=>setChosenPayer(null)} className="text-xs text-blue-600 hover:underline">Cambiar</button>
                  </div>
                ) : (
                  <>
                    <input value={payerQuery} onChange={async (e)=>{
                      const val = e.target.value; setPayerQuery(val);
                      if(val.trim().length < 2){ setPayerResults([]); return; }
                      try { const r = await PatientsApi.search({ q: val, limit: 8 }, token); setPayerResults(r.data || []); } catch { setPayerResults([]); }
                    }} placeholder="Buscar por nombre o cédula" className="w-full border rounded px-3 py-2 text-sm" />
                    <div className="mt-2 max-h-40 overflow-y-auto divide-y border rounded">
                      {(payerResults||[]).length === 0 ? (
                        <div className="p-3 text-xs text-gray-500">Sin resultados</div>
                      ) : payerResults.map(p => (
                        <button key={p.id} onClick={()=>{ setChosenPayer(p); setPayerResults([]); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">
                          <div className="font-medium text-sm">{p.full_name}</div>
                          <div className="text-xs text-gray-500">CI {p.cedula}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>setCreateOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={async ()=>{
                if(!chosenPatient || !chosenPayer){ toast.warning('Selecciona paciente y pagador'); return; }
                try{
                  const res = await accountsApi.createAccount({ patient_id: chosenPatient.id, payer_patient_id: chosenPayer.id }, token);
                  const id = res?.data?.id;
                  if(id){
                    toast.success('Cuenta creada');
                    setCreateOpen(false);
                    await load();
                    await loadDetails(id);
                    setStage('services');
                  } else {
                    toast.error('La API no confirmó la creación');
                  }
                }catch(e){ toast.error(e?.response?.data?.error || 'No se pudo crear la cuenta'); }
              }} className="px-4 py-2 rounded-lg bg-gray-900 text-white">Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
