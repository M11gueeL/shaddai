import React, { useEffect, useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  CreditCard, 
  Archive, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Calendar,
  User,
  MoreVertical,
  AlertCircle,
  TrendingUp,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Package,
  History,
  LayoutDashboard
} from 'lucide-react';
import * as servicesApi from '../../api/services';
import * as paymentsApi from '../../api/payments';
import * as cashApi from '../../api/cashregister';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export default function PaymentAudit() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Auditoría y Control
          </h2>
          <p className="text-gray-500 mt-1">Gestión administrativa, verificación de pagos y control de servicios</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
          <NavTab active={tab === 'dashboard'} onClick={() => setTab('dashboard')} icon={LayoutDashboard} label="Resumen" />
          <NavTab active={tab === 'payments'} onClick={() => setTab('payments')} icon={CreditCard} label="Pagos" count={null} />
          <NavTab active={tab === 'services'} onClick={() => setTab('services')} icon={Package} label="Servicios" />
          <NavTab active={tab === 'sessions'} onClick={() => setTab('sessions')} icon={History} label="Cajas" />
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {tab === 'dashboard' && <AuditDashboard navigateTo={setTab} />}
        {tab === 'payments' && <PendingPayments />}
        {tab === 'services' && <ServicesManager />}
        {tab === 'sessions' && <SessionsAdmin />}
      </div>
    </div>
  );
}

function NavTab({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
        ${active 
          ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
      `}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
      {label}
      {count !== null && count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function AuditDashboard({ navigateTo }) {
  const { token } = useAuth();
  const [pending, setPending] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  useEffect(() => {
    (async () => {
      try { const p = await paymentsApi.listPendingPayments(token); setPending(p.data || []); } catch {}
      try { const s = await cashApi.adminListSessions(token); setSessions(s.data || []); } catch {}
    })();
  }, [token]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const sessionsToday = sessions.filter(s => (s.start_time || s.opened_at || '').startsWith(todayIso)).length;
  const pendingUsd = pending.reduce((acc, p) => acc + Number(p.amount_usd_equivalent || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Pagos por Verificar" 
          value={pending.length} 
          icon={AlertCircle} 
          color="amber" 
          desc="Requieren acción inmediata"
        />
        <StatCard 
          label="Monto Pendiente USD" 
          value={`$${pendingUsd.toFixed(2)}`} 
          icon={DollarSign} 
          color="indigo" 
          desc="En transacciones por aprobar"
        />
        <StatCard 
          label="Cajas Abiertas Hoy" 
          value={sessionsToday} 
          icon={Activity} 
          color="emerald" 
          desc="Sesiones activas en sistema"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Últimos Pagos Pendientes
            </h3>
            <button onClick={() => navigateTo('payments')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Ver todos</button>
          </div>
          
          <div className="space-y-3">
            {pending.length === 0 ? (
               <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No hay pagos pendientes
               </div>
            ) : pending.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50/50 rounded-2xl transition-colors group cursor-pointer" onClick={() => navigateTo('payments')}>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm">
                       <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                       <div className="font-bold text-gray-900 flex items-center gap-2">
                          {p.currency} {Number(p.amount).toFixed(2)}
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Pendiente</span>
                       </div>
                       <div className="text-xs text-gray-500">
                          {mapMethod(p.payment_method)} • Cuenta #{p.account_id}
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs font-bold text-gray-900">~${Number(p.amount_usd_equivalent).toFixed(2)}</div>
                    <div className="text-[10px] text-gray-400">{formatDateTime(p.payment_date)}</div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" /> Sesiones Recientes
            </h3>
            <button onClick={() => navigateTo('sessions')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Ver todas</button>
          </div>

          <div className="space-y-3">
             {sessions.length === 0 ? (
               <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No hay actividad de sesiones
               </div>
            ) : sessions.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shadow-sm ${s.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-400'}`}>
                       <User className="w-5 h-5" />
                    </div>
                    <div>
                       <div className="font-bold text-gray-900">{formatUser(s)}</div>
                       <div className="text-xs text-gray-500">
                          Inició: {formatDateTime(s.start_time || s.opened_at)}
                       </div>
                    </div>
                 </div>
                 <div className={`text-xs font-bold px-2 py-1 rounded-lg ${s.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                    {s.status === 'open' ? 'ABIERTA' : 'CERRADA'}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingPayments() {
  const { token } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [filter, setFilter] = useState('');

  const load = async () => {
    try { 
      setLoading(true); 
      const res = await paymentsApi.listPendingPayments(token); 
      setItems(res.data || []); 
    } catch (e) { 
      toast.error(e?.response?.data?.error || 'No se pudo cargar pagos'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const verify = async (pid) => {
    setVerifying(pid);
    try { 
      await paymentsApi.verifyPayment(pid, token); 
      toast.success('Pago verificado exitosamente'); 
      await load(); 
    } catch (e) { 
      toast.error(e?.response?.data?.error || 'No se pudo verificar'); 
    } finally { 
      setVerifying(null); 
    }
  };

  const filtered = useMemo(() => {
    if (!filter) return items;
    const f = filter.toLowerCase();
    return items.filter(p => 
      String(p.account_id).includes(f) || 
      (p.reference_number || '').toLowerCase().includes(f) || 
      p.payment_method.toLowerCase().includes(f)
    );
  }, [filter, items]);

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h3 className="font-bold text-xl text-gray-900">Pagos Pendientes</h3>
           <p className="text-sm text-gray-500">Verifica y aprueba las transacciones realizadas</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" 
                placeholder="Buscar por referencia..." 
              />
           </div>
           <button onClick={load} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <History className="w-5 h-5" />
           </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
           <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-gray-300" />
           </div>
           <p className="text-gray-500 font-medium">Todo está al día</p>
           <p className="text-sm text-gray-400">No hay pagos pendientes de verificación</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all group">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                     <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="bg-gray-50 px-3 py-1 rounded-lg text-xs font-mono text-gray-500">
                     #{p.account_id}
                  </div>
               </div>

               <div className="space-y-1 mb-4">
                  <div className="text-2xl font-bold text-gray-900">{p.currency} {Number(p.amount).toFixed(2)}</div>
                  <div className="text-sm text-gray-500 font-medium">{mapMethod(p.payment_method)}</div>
                  {p.reference_number && (
                    <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded inline-block mt-1">Ref: {p.reference_number}</div>
                  )}
               </div>

               <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div>
                     <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">FECHA</div>
                     <div className="text-xs font-medium text-gray-700">{formatDateTime(p.payment_date)}</div>
                  </div>
                  <button 
                    disabled={verifying === p.id} 
                    onClick={() => verify(p.id)} 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-900/10"
                  >
                     {verifying === p.id ? '...' : 'Verificar'}
                     <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesManager() {
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
    } catch (e) { toast.error('No se pudo cargar servicios'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      setSaving(true);
      if (editing) await servicesApi.updateService(editing.id, form, token);
      else await servicesApi.createService(form, token);
      toast.success(editing ? 'Servicio actualizado' : 'Servicio creado');
      setForm({ name: '', price_usd: '', is_active: 1 }); setEditing(null);
      await load();
    } catch (e) { toast.error(e?.response?.data?.error || 'No se pudo guardar'); }
    finally { setSaving(false); }
  };

  const askDelete = async (id) => {
    if (!await confirm({ title: 'Eliminar servicio', tone: 'danger', message: '¿Deseas eliminar este servicio?' })) return;
    try { await servicesApi.deleteService(id, token); toast.success('Eliminado'); load(); } catch (e) { toast.error(e?.response?.data?.error || 'No se pudo eliminar'); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form (1/3) */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sticky top-6">
           <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
             <Edit2 className="w-5 h-5 text-indigo-600" />
             {editing ? 'Editar Servicio' : 'Nuevo Servicio'}
           </h3>
           
           <div className="space-y-4">
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nombre del Servicio</label>
                 <input 
                   className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                   placeholder="Ej: Consulta General" 
                   value={form.name} 
                   onChange={(e) => setForm(f => ({...f, name: e.target.value}))} 
                 />
              </div>
              
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Precio (USD)</label>
                 <div className="relative mt-1">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="number" 
                      step="0.01" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                      placeholder="0.00" 
                      value={form.price_usd} 
                      onChange={(e) => setForm(f => ({...f, price_usd: e.target.value}))} 
                    />
                 </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="active_check"
                  checked={!!Number(form.is_active)} 
                  onChange={(e) => setForm(f => ({...f, is_active: e.target.checked ? 1 : 0}))} 
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500/20"
                /> 
                <label htmlFor="active_check" className="text-sm font-medium text-gray-700 cursor-pointer">Servicio Activo</label>
              </div>

              <div className="flex gap-2 pt-2">
                 {editing && (
                   <button 
                     onClick={() => { setEditing(null); setForm({ name: '', price_usd: '', is_active: 1 }); }} 
                     className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 flex-1 transition-colors"
                   >
                     Cancelar
                   </button>
                 )}
                 <button 
                   disabled={saving || !form.name || !form.price_usd} 
                   onClick={submit} 
                   className="px-4 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 flex-1 shadow-lg shadow-gray-900/10 transition-all"
                 >
                   {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Servicio'}
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* List (2/3) */}
      <div className="lg:col-span-2">
         <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-900">Catalogo de Servicios</h3>
               <button onClick={load} className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-indigo-600 transition-all"><History className="w-5 h-5"/></button>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                     <tr>
                        <th className="text-left px-6 py-4">Nombre</th>
                        <th className="text-right px-6 py-4">Precio</th>
                        <th className="text-center px-6 py-4">Estado</th>
                        <th className="text-right px-6 py-4">Acciones</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {loading ? (
                        <tr><td colSpan={4} className="p-10 text-center text-gray-400">Cargando catálogo...</td></tr>
                     ) : items.length === 0 ? (
                        <tr><td colSpan={4} className="p-10 text-center text-gray-400">No hay servicios registrados</td></tr>
                     ) : items.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                           <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                           <td className="px-6 py-4 text-right font-mono text-gray-600">${Number(s.price_usd).toFixed(2)}</td>
                           <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${Number(s.is_active) ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                 {Number(s.is_active) ? 'ACTIVO' : 'INACTIVO'}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                 <button 
                                   onClick={() => { setEditing(s); setForm({ name: s.name, price_usd: s.price_usd, is_active: s.is_active }); }} 
                                   className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                 >
                                    <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button 
                                   onClick={() => askDelete(s.id)} 
                                   className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}

function SessionsAdmin() {
  const { token } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setLoading(true); const res = await cashApi.adminListSessions(token); setItems(res.data || []); } catch (e) { toast.error('No se pudo cargar sesiones'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
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
          {items.map(s => (
            <div key={s.id} className="group flex flex-col p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                       <Archive className="w-5 h-5" />
                    </div>
                    <div>
                       <div className="font-bold text-gray-900">Sesión #{s.id}</div>
                       <div className="text-xs text-gray-500">{formatUser(s)}</div>
                    </div>
                 </div>
                 <div className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase ${s.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {s.status === 'open' ? 'Abierta' : 'Cerrada'}
                 </div>
              </div>

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

              <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Base USD</div>
                    <div className="font-bold text-gray-900">${Number(s.start_balance_usd || 0).toFixed(2)}</div>
                 </div>
                 <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Base Bs</div>
                    <div className="font-bold text-gray-900">Bs {Number(s.start_balance_bs || 0).toFixed(2)}</div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, desc }) {
  const colors = {
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-start justify-between hover:-translate-y-1 transition-transform duration-300">
       <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          {desc && <p className="text-xs text-gray-500 font-medium">{desc}</p>}
       </div>
       <div className={`p-3 rounded-2xl ${colors[color] || 'bg-gray-50 text-gray-600'} shadow-sm`}>
          <Icon className="w-6 h-6" />
       </div>
    </div>
  );
}

function formatDateTime(dt) {
  if (!dt) return '-';
  const norm = typeof dt === 'string' && dt.includes(' ') && !dt.includes('T') ? dt.replace(' ', 'T') : dt;
  const d = new Date(norm);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function mapMethod(m) {
  const map = {
    cash_usd: 'Divisas en Efectivo',
    cash_bs: 'Bolívares en Efectivo',
    transfer_bs: 'Transferencia',
    mobile_payment_bs: 'Pago Móvil'
  }; 
  return map[m] || m;
}

function formatUser(s) {
  const fn = s.first_name || s.firstName || ''; 
  const ln = s.last_name || s.lastName || '';
  const full = [fn, ln].filter(Boolean).join(' ');
  return full || `Usuario ${s.user_id}`;
}
