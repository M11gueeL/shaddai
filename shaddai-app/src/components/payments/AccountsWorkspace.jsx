import React, { useEffect, useMemo, useState } from 'react';
import * as accountsApi from '../../api/accounts';
import * as servicesApi from '../../api/services';
import * as paymentsApi from '../../api/payments';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

function StatusBadge({ status }){
  const map = {
    open: { label: 'Abierta', cls: 'bg-emerald-100 text-emerald-700' },
    partial: { label: 'Parcial', cls: 'bg-amber-100 text-amber-700' },
    paid: { label: 'Pagada', cls: 'bg-gray-100 text-gray-700' }
  };
  const m = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-1 rounded text-xs ${m.cls}`}>{m.label}</span>;
}

export default function AccountsWorkspace(){
  const { token } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [method, setMethod] = useState('cash_bs');
  const [amount, setAmount] = useState('');
  const [ref, setRef] = useState('');
  const [file, setFile] = useState(null);

  const load = async()=>{
    try{
      setLoading(true);
      const [accRes, srvRes] = await Promise.all([
        accountsApi.listAccounts(undefined, token),
        servicesApi.listServices(token)
      ]);
      setAccounts(accRes.data || []);
      setServices(srvRes.data || []);
    }catch(e){
      toast.error('No se pudo cargar');
    }finally{ setLoading(false); }
  };

  const loadDetails = async(accountId)=>{
    try{
      const res = await accountsApi.getAccount(accountId, token);
      setDetails(res.data?.details || []);
      setSelected(res.data?.account || null);
    }catch(e){ setDetails([]); setSelected(null); }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);

  const addService = async(serviceId)=>{
    if(!selected) return;
    try{
      await accountsApi.addDetail(selected.id, { service_id: serviceId }, token);
      toast.success('Servicio agregado');
      loadDetails(selected.id);
    }catch(e){ toast.error(e?.response?.data?.error || 'No se pudo agregar'); }
  };

  const removeDetail = async(detailId)=>{
    if(!selected) return;
    const ok = await confirm({ title: 'Eliminar detalle', description: '¿Deseas quitar este servicio de la cuenta?' });
    if(!ok) return;
    try{
      await accountsApi.removeDetail(detailId, token);
      toast.success('Detalle eliminado');
      loadDetails(selected.id);
    }catch(e){ toast.error(e?.response?.data?.error || 'No se pudo eliminar'); }
  };

  const submitPayment = async(e)=>{
    e.preventDefault();
    if(!selected) return toast.warning('Selecciona una cuenta');
    const a = parseFloat(amount);
    if(!a || a<=0) return toast.warning('Monto inválido');

    // Currency rule: only cash_usd goes in USD; others Bs
    const currency = method === 'cash_usd' ? 'USD' : 'BS';
    const form = new FormData();
    form.append('method', method);
    form.append('amount', a);
    form.append('currency', currency);
    if(ref) form.append('reference', ref);
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
    }catch(e){ toast.error(e?.response?.data?.error || 'No se pudo registrar el pago'); }
  };

  const totalBs = useMemo(()=>details.reduce((s,d)=> s + Number(d.price_bs||0),0),[details]);
  const totalUsd = useMemo(()=>details.reduce((s,d)=> s + Number(d.price_usd||0),0),[details]);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-900">Cuentas de Cobro</h2>
      <p className="text-sm text-gray-600">Administra cuentas, agrega servicios y registra pagos.</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Cuentas</h3>
          </div>
          <div className="mt-2 max-h-[480px] overflow-y-auto divide-y">
            {loading ? (
              <div className="h-40 bg-gray-100 rounded animate-pulse" />
            ) : accounts.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Sin cuentas</div>
            ) : accounts.map(acc => (
              <button
                key={acc.id}
                onClick={()=>loadDetails(acc.id)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${selected?.id===acc.id?'bg-gray-50':''}`}
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

        <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:col-span-2">
          {!selected ? (
            <div className="text-gray-500">Selecciona una cuenta para ver detalles</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-3">
                <h3 className="font-medium">Detalles</h3>
                <div className="mt-2 rounded-lg border divide-y">
                  {details.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">Sin servicios</div>
                  ) : details.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3">
                      <div>
                        <div className="font-medium text-sm">{d.service_name}</div>
                        <div className="text-xs text-gray-500">USD {Number(d.price_usd||0).toFixed(2)} · Bs {Number(d.price_bs||0).toFixed(2)}</div>
                      </div>
                      <button
                        onClick={()=>removeDetail(d.id)}
                        className="text-xs text-red-600 hover:underline"
                      >Quitar</button>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <h4 className="text-sm text-gray-700 mb-1">Agregar servicio</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-44 overflow-y-auto">
                    {services.map(s => (
                      <button key={s.id} onClick={()=>addService(s.id)} className="px-3 py-2 text-sm rounded border hover:bg-gray-50">
                        <div className="font-medium truncate" title={s.name}>{s.name}</div>
                        <div className="text-xs text-gray-500">USD {Number(s.price_usd||0).toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-medium">Registrar pago</h3>
                <form onSubmit={submitPayment} className="mt-2 space-y-2">
                  <select value={method} onChange={(e)=>setMethod(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="cash_bs">Efectivo Bs</option>
                    <option value="cash_usd">Divisas (efectivo)</option>
                    <option value="transfer">Transferencia</option>
                    <option value="mobile">Pago móvil</option>
                  </select>
                  <input type="number" step="0.01" min="0" className="w-full border rounded px-3 py-2 text-sm" placeholder="Monto" value={amount} onChange={(e)=>setAmount(e.target.value)} />
                  {(method==='transfer' || method==='mobile') && (
                    <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Referencia" value={ref} onChange={(e)=>setRef(e.target.value)} />
                  )}
                  {(method==='transfer' || method==='mobile') && (
                    <input type="file" accept="image/*,.pdf" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="w-full text-sm" />
                  )}
                  <div className="text-xs text-gray-500">Total: USD {totalUsd.toFixed(2)} · Bs {totalBs.toFixed(2)}</div>
                  <div className="flex justify-end">
                    <button className="px-4 py-2 rounded bg-gray-900 text-white text-sm">Guardar pago</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
