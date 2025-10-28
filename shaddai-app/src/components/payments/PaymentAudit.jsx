import React, { useEffect, useState } from 'react';
import * as servicesApi from '../../api/services';
import * as accountsApi from '../../api/accounts';
import * as paymentsApi from '../../api/payments';
import * as cashApi from '../../api/cashregister';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export default function PaymentAudit(){
  const [tab, setTab] = useState('services');
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <TabBtn active={tab==='services'} onClick={()=>setTab('services')}>Servicios</TabBtn>
        <TabBtn active={tab==='payments'} onClick={()=>setTab('payments')}>Pagos por verificar</TabBtn>
        <TabBtn active={tab==='sessions'} onClick={()=>setTab('sessions')}>Sesiones de caja</TabBtn>
      </div>
      {tab==='services' && <ServicesManager />}
      {tab==='payments' && <PendingPayments />}
      {tab==='sessions' && <SessionsAdmin />}
    </div>
  );
}

function TabBtn({ active, children, ...props }){
  return <button {...props} className={`px-3 py-2 rounded-xl text-sm font-medium ${active? 'bg-gray-900 text-white' : 'bg-white border'} `}>{children}</button>;
}

function Card({ title, action, children }){
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="ml-auto">{action}</div>
      </div>
      {children}
    </div>
  );
}

function ServicesManager(){
  const { token } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price_usd: '', is_active: 1 });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await servicesApi.listServices(token);
      setItems(res.data || []);
    } catch(e){ toast.error('No se pudo cargar servicios'); }
    finally{ setLoading(false); }
  };
  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);

  const submit = async () => {
    try{
      setSaving(true);
      if (editing) await servicesApi.updateService(editing.id, form, token);
      else await servicesApi.createService(form, token);
      toast.success(editing? 'Servicio actualizado' : 'Servicio creado');
      setForm({ name: '', price_usd: '', is_active: 1 }); setEditing(null);
      await load();
    } catch(e){ toast.error(e?.response?.data?.error || 'No se pudo guardar'); }
    finally{ setSaving(false); }
  };

  const askDelete = async (id) => {
    const ok = await confirm({ title: 'Eliminar servicio', tone: 'danger', message: '¿Deseas eliminar este servicio?' });
    if (!ok) return;
    try { await servicesApi.deleteService(id, token); toast.success('Eliminado'); load(); } catch(e){ toast.error(e?.response?.data?.error || 'No se pudo eliminar'); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title={editing? 'Editar servicio' : 'Nuevo servicio'} action={null}>
        <div className="space-y-2">
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nombre" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} />
          <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Precio USD" value={form.price_usd} onChange={(e)=>setForm(f=>({...f,price_usd:e.target.value}))} />
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={!!Number(form.is_active)} onChange={(e)=>setForm(f=>({...f,is_active: e.target.checked?1:0}))} /> Activo
          </label>
          <div className="flex justify-end gap-2">
            {editing && <button onClick={()=>{setEditing(null); setForm({ name:'', price_usd:'', is_active:1 });}} className="px-3 py-2 rounded-lg border">Cancelar</button>}
            <button disabled={saving} onClick={submit} className="px-3 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60">{saving? 'Guardando…':'Guardar'}</button>
          </div>
        </div>
      </Card>

      <Card title="Servicios" action={<button onClick={load} className="px-3 py-1.5 rounded-lg border">Recargar</button>}>
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-2">Nombre</th>
                <th className="text-right p-2">USD</th>
                <th className="text-left p-2">Estado</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {loading? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Cargando…</td></tr>
              ) : items.length===0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Sin registros</td></tr>
              ) : items.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2 text-right">{Number(s.price_usd).toFixed(2)}</td>
                  <td className="p-2">{Number(s.is_active)? 'Activo':'Inactivo'}</td>
                  <td className="p-2 text-right space-x-2">
                    <button onClick={()=>{setEditing(s); setForm({ name:s.name, price_usd:s.price_usd, is_active:s.is_active});}} className="px-2 py-1 text-xs rounded border">Editar</button>
                    <button onClick={()=>askDelete(s.id)} className="px-2 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-200">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PendingPayments(){
  const { token } = useAuth();
  const toast = useToast();
  const [accountId, setAccountId] = useState('');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!accountId) return;
    try{ setLoading(true); const res = await accountsApi.getAccount(accountId, token); setAccount(res.data);} catch(e){ toast.error(e?.response?.data?.error || 'No se pudo cargar la cuenta'); setAccount(null);} finally{ setLoading(false);}  
  };

  const verify = async (pid) => {
    try { await paymentsApi.verifyPayment(pid, token); toast.success('Pago verificado'); await load(); } catch(e){ toast.error(e?.response?.data?.error || 'No se pudo verificar'); }
  };

  const pending = (account?.payments||[]).filter(p=>p.status==='pending_verification');

  return (
    <Card title="Pagos por verificar" action={null}>
      <div className="flex items-end gap-2 mb-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">ID de cuenta</label>
          <input value={accountId} onChange={(e)=>setAccountId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" placeholder="Ej: 102" />
        </div>
        <button onClick={load} className="px-3 py-2 rounded-lg border">Buscar</button>
      </div>
      {loading ? (
        <div className="text-sm text-gray-500">Cargando…</div>
      ) : !account ? (
        <div className="text-sm text-gray-500">Ingresa un ID de cuenta para revisar sus pagos pendientes.</div>
      ) : pending.length===0 ? (
        <div className="text-sm text-gray-500">No hay pagos pendientes en esta cuenta.</div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-2">Fecha</th>
                <th className="text-left p-2">Método</th>
                <th className="text-right p-2">Monto</th>
                <th className="text-left p-2">Moneda</th>
                <th className="text-left p-2">Referencia</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {pending.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-2">{p.created_at}</td>
                  <td className="p-2">{p.payment_method}</td>
                  <td className="p-2 text-right">{Number(p.amount).toFixed(2)}</td>
                  <td className="p-2">{p.currency}</td>
                  <td className="p-2">{p.reference_number || '-'}</td>
                  <td className="p-2 text-right"><button onClick={()=>verify(p.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white">Verificar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function SessionsAdmin(){
  const { token } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try{ setLoading(true); const res = await cashApi.adminListSessions(token); setItems(res.data||[]); } catch(e){ toast.error('No se pudo cargar sesiones'); } finally{ setLoading(false); }
  };
  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);

  return (
    <Card title="Sesiones de caja" action={<button onClick={load} className="px-3 py-1.5 rounded-lg border">Recargar</button>}>
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Usuario</th>
              <th className="text-left p-2">Abrió</th>
              <th className="text-left p-2">Cerró</th>
              <th className="text-left p-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Cargando…</td></tr>
            ) : items.length===0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Sin registros</td></tr>
            ) : items.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-2">{s.id}</td>
                <td className="p-2">{s.user_id}</td>
                <td className="p-2">{s.opened_at}</td>
                <td className="p-2">{s.closed_at || '-'}</td>
                <td className="p-2">{s.status === 'open' ? 'Abierta' : s.status === 'closed' ? 'Cerrada' : s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
