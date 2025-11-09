import React, { useEffect, useState, useMemo } from 'react';
import * as servicesApi from '../../api/services';
import * as paymentsApi from '../../api/payments';
import * as cashApi from '../../api/cashregister';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export default function PaymentAudit(){
  const [tab, setTab] = useState('dashboard');
  return (
    <div className="p-4 sm:p-6">
      {/* Header descriptivo */}
      <div className="flex items-start gap-3 mb-4">
        <span className="inline-block w-1.5 h-7 rounded-full bg-gradient-to-b from-indigo-500 via-sky-500 to-cyan-400" />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 leading-none">Auditoría y Control</h2>
          <p className="text-xs text-gray-600 mt-1">Panel exclusivo para administración: gestión de servicios, verificación de pagos y revisión de sesiones de caja.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <TabBtn active={tab==='dashboard'} onClick={()=>setTab('dashboard')}>Resumen</TabBtn>
        <TabBtn active={tab==='payments'} onClick={()=>setTab('payments')}>Pagos pendientes</TabBtn>
        <TabBtn active={tab==='services'} onClick={()=>setTab('services')}>Servicios</TabBtn>
        <TabBtn active={tab==='sessions'} onClick={()=>setTab('sessions')}>Sesiones de caja</TabBtn>
      </div>

      {tab==='dashboard' && <AuditDashboard navigateTo={setTab} />}
      {tab==='payments' && <PendingPayments />}
      {tab==='services' && <ServicesManager />}
      {tab==='sessions' && <SessionsAdmin />}
    </div>
  );
}

function TabBtn({ active, children, ...props }){
  return <button {...props} className={`px-3 py-2 rounded-xl text-sm font-medium transition ${active? 'bg-gray-900 text-white shadow-sm' : 'bg-white border text-gray-700 hover:bg-gray-50'} `}>{children}</button>;
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [filter, setFilter] = useState('');

  const load = async () => {
    try{ setLoading(true); const res = await paymentsApi.listPendingPayments(token); setItems(res.data||[]); } catch(e){ toast.error(e?.response?.data?.error || 'No se pudo cargar pagos'); } finally{ setLoading(false); }
  };
  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);

  const verify = async (pid) => {
    setVerifying(pid);
    try { await paymentsApi.verifyPayment(pid, token); toast.success('Pago verificado'); await load(); } catch(e){ toast.error(e?.response?.data?.error || 'No se pudo verificar'); } finally{ setVerifying(null); }
  };

  const filtered = useMemo(()=>{
    if(!filter) return items;
    const f = filter.toLowerCase();
    return items.filter(p => String(p.account_id).includes(f) || (p.reference_number||'').toLowerCase().includes(f) || p.payment_method.toLowerCase().includes(f));
  },[filter, items]);

  return (
    <div className="space-y-4">
      <Card title="Pagos pendientes de verificación" action={<button onClick={load} className="px-3 py-1.5 rounded-lg border">Refrescar</button>}>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs text-gray-600 mb-1">Buscar (cuenta, método, referencia)</label>
            <input value={filter} onChange={(e)=>setFilter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ej: transferencia" />
          </div>
          <div className="text-xs text-gray-500">Total: {filtered.length}</div>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Cargando…</div>
        ) : filtered.length===0 ? (
          <div className="text-sm text-gray-500">No hay pagos pendientes.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(p => (
              <div key={p.id} className="relative rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-4 shadow-sm">
                <span className="absolute left-0 top-5 h-7 w-1 rounded-full bg-gradient-to-b from-amber-500 to-orange-400" />
                <div className="pl-3 space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Cuenta #{p.account_id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700">Pendiente</span>
                  </div>
                  <div className="text-gray-700 font-medium">{Number(p.amount).toFixed(2)} {p.currency}</div>
                  <div className="text-xs text-gray-600">Equiv. USD: {Number(p.amount_usd_equivalent).toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Método: {mapMethod(p.payment_method)}</div>
                  {p.reference_number && <div className="text-xs text-gray-600">Ref: {p.reference_number}</div>}
                  <div className="text-xs text-gray-500">Fecha: {formatDateTime(p.payment_date)}</div>
                  <div className="pt-2 flex justify-end">
                    <button disabled={verifying===p.id} onClick={()=>verify(p.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs disabled:opacity-50">{verifying===p.id?'Verificando…':'Verificar'}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
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
    <Card title="Sesiones de caja" action={<button onClick={load} className="px-3 py-1.5 rounded-lg border">Refrescar</button>}>
      {loading ? (
        <div className="text-sm text-gray-500">Cargando…</div>
      ) : items.length===0 ? (
        <div className="text-sm text-gray-500">Sin registros</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map(s => (
            <div key={s.id} className="relative rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-4 shadow-sm">
              <span className={`absolute left-0 top-5 h-7 w-1 rounded-full ${s.status==='open'?'bg-gradient-to-b from-emerald-500 to-teal-400':'bg-gradient-to-b from-slate-400 to-gray-500'}`} />
              <div className="pl-3 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Sesión #{s.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${s.status==='open'?'bg-emerald-100 text-emerald-700':'bg-slate-200 text-slate-700'}`}>{s.status==='open'?'Abierta':'Cerrada'}</span>
                </div>
                <div className="text-xs text-gray-600">Usuario: {formatUser(s)}</div>
                <div className="text-xs text-gray-600">Inicio: {formatDateTime(s.start_time || s.opened_at)}</div>
                <div className="text-xs text-gray-600">Fin: {s.end_time || s.closed_at ? formatDateTime(s.end_time || s.closed_at) : '-'}</div>
                <div className="pt-1 grid grid-cols-2 gap-2 text-[11px] text-gray-700">
                  <div>
                    <div className="font-medium">Apertura USD</div>
                    <div>{Number(s.start_balance_usd||0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Apertura Bs</div>
                    <div>{Number(s.start_balance_bs||0).toFixed(2)}</div>
                  </div>
                  {s.calculated_end_balance_usd!==null && (
                    <div>
                      <div className="font-medium">Calc USD</div>
                      <div>{Number(s.calculated_end_balance_usd||0).toFixed(2)}</div>
                    </div>
                  )}
                  {s.calculated_end_balance_bs!==null && (
                    <div>
                      <div className="font-medium">Calc Bs</div>
                      <div>{Number(s.calculated_end_balance_bs||0).toFixed(2)}</div>
                    </div>
                  )}
                </div>
                {s.notes && <div className="text-[11px] text-gray-500 mt-1">Notas: {s.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function AuditDashboard({ navigateTo }){
  const { token } = useAuth();
  const [pending, setPending] = useState([]);
  const [sessions, setSessions] = useState([]);
  useEffect(()=>{
    (async()=>{
      try { const p = await paymentsApi.listPendingPayments(token); setPending(p.data||[]); } catch{}
      try { const s = await cashApi.adminListSessions(token); setSessions(s.data||[]); } catch{}
    })();
  },[token]);
  const todayIso = new Date().toISOString().slice(0,10);
  const sessionsToday = sessions.filter(s=> (s.start_time||s.opened_at||'').startsWith(todayIso)).length;
  const pendingUsd = pending.reduce((acc,p)=> acc + Number(p.amount_usd_equivalent||0), 0);
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* Panel de métricas + últimos pagos */}
      <div className="relative rounded-3xl border border-gray-200 bg-white/80 backdrop-blur p-5 shadow-sm ring-1 ring-sky-100">
        <div className="absolute inset-x-0 -top-px h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 rounded-t-3xl" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-sky-50 rounded-xl grid place-content-center">🛡️</div>
            <div className="text-sm font-semibold text-gray-900">Resumen rápido</div>
          </div>
          <button onClick={()=>navigateTo('payments')} className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-gray-50">Ver pagos</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Pagos pendientes" value={pending.length} tone="amber" icon="⏳" />
          <StatBox label="Equivalente USD" value={pendingUsd.toFixed(2)} suffix=" USD" tone="indigo" icon="💵" />
          <StatBox label="Sesiones hoy" value={sessionsToday} tone="emerald" icon="🧾" />
        </div>
        <div className="mt-5">
          <div className="text-xs text-gray-500 mb-2">Últimos pagos pendientes</div>
          <div className="space-y-2">
            {pending.slice(0,4).map(p=>(
              <div key={p.id} className="group relative rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm hover:shadow transition">
                <span className="absolute left-0 top-3 h-5 w-1 rounded-full bg-gradient-to-b from-amber-500 to-orange-400" />
                <div className="pl-3 flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-gray-800">Cuenta #{p.account_id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pendiente</span>
                </div>
                <div className="pl-3 mt-1 text-gray-600 flex items-center gap-2">
                  <span>{mapMethod(p.payment_method)}</span>
                  <span className="font-medium text-gray-800">· {Number(p.amount).toFixed(2)} {p.currency}</span>
                  <span className="hidden sm:inline text-gray-500">· USD {Number(p.amount_usd_equivalent).toFixed(2)}</span>
                </div>
                <div className="pl-3 mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">{formatDateTime(p.payment_date)}</span>
                  <button onClick={()=>navigateTo('payments')} className="text-[11px] px-2 py-1 rounded bg-emerald-600 text-white">Verificar</button>
                </div>
              </div>
            ))}
            {pending.length===0 && <div className="text-xs text-gray-500">Sin pagos pendientes</div>}
          </div>
        </div>
      </div>
      {/* Panel de sesiones recientes */}
      <div className="relative rounded-3xl border border-gray-200 bg-white/80 backdrop-blur p-5 shadow-sm ring-1 ring-slate-100">
        <div className="absolute inset-x-0 -top-px h-1 bg-gradient-to-r from-slate-400 via-gray-400 to-slate-500 rounded-t-3xl" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-slate-50 rounded-xl grid place-content-center">📋</div>
            <div className="text-sm font-semibold text-gray-900">Sesiones recientes</div>
          </div>
          <button onClick={()=>navigateTo('sessions')} className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-gray-50">Ver todas</button>
        </div>
        <div className="space-y-2">
          {sessions.slice(0,5).map(s => (
            <div key={s.id} className="relative rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
              <span className={`absolute left-0 top-3 h-5 w-1 rounded-full ${s.status==='open'?'bg-gradient-to-b from-emerald-500 to-teal-400':'bg-gradient-to-b from-slate-400 to-gray-500'}`} />
              <div className="pl-3 flex items-center justify-between gap-2">
                <span className="truncate">#{s.id} • {formatUser(s)} • {formatDateTime(s.start_time||s.opened_at)}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${s.status==='open'?'bg-emerald-100 text-emerald-700':'bg-slate-200 text-slate-700'}`}>{s.status==='open'?'Abierta':'Cerrada'}</span>
              </div>
            </div>
          ))}
          {sessions.length===0 && <div className="text-xs text-gray-500">Sin sesiones recientes</div>}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, suffix='', tone='sky', icon }){
  const tones = {
    sky:{ ring:'ring-sky-100', dot:'from-sky-500 to-cyan-400', iconBg:'bg-sky-50', text:'text-sky-700' },
    amber:{ ring:'ring-amber-100', dot:'from-amber-500 to-orange-400', iconBg:'bg-amber-50', text:'text-amber-700' },
    emerald:{ ring:'ring-emerald-100', dot:'from-emerald-500 to-teal-400', iconBg:'bg-emerald-50', text:'text-emerald-700' },
    indigo:{ ring:'ring-indigo-100', dot:'from-indigo-500 to-violet-500', iconBg:'bg-indigo-50', text:'text-indigo-700' },
  };
  const c = tones[tone] || tones.sky;
  return (
    <div className={`relative rounded-2xl border border-gray-200 bg-white p-3 shadow-sm ring-1 ${c.ring}`}>
      <span className={`absolute left-0 top-3 h-5 w-1 rounded-full bg-gradient-to-b ${c.dot}`} />
      <div className="pl-3 flex items-center gap-2">
        <div className={`h-7 w-7 ${c.iconBg} rounded-lg grid place-content-center text-sm`}>{icon || '•'}</div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
          <div className="text-lg font-semibold text-gray-900">{value}{suffix}</div>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(dt){
  if(!dt) return '-';
  const norm = typeof dt==='string' && dt.includes(' ') && !dt.includes('T') ? dt.replace(' ','T') : dt;
  const d = new Date(norm);
  if(Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString('es-VE',{ year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'});
}

function mapMethod(m){
  const map = {
    cash_usd:'Efectivo USD', cash_bs:'Efectivo Bs', transfer_bs:'Transferencia Bs', mobile_payment_bs:'Pago móvil Bs'
  }; return map[m] || m;
}

function formatUser(s){
  const fn = s.first_name || s.firstName || ''; const ln = s.last_name || s.lastName || '';
  const full = [fn, ln].filter(Boolean).join(' ');
  return full || `Usuario ${s.user_id}`;
}
