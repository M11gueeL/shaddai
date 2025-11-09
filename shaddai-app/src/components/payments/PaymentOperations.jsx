import React, { useEffect, useMemo, useState } from 'react';
import * as ratesApi from '../../api/rates';
import * as cashApi from '../../api/cashregister';
import * as servicesApi from '../../api/services';
import * as accountsApi from '../../api/accounts';
import * as paymentsApi from '../../api/payments';
import * as receiptsApi from '../../api/receipts';
import * as inventoryApi from '../../api/inventoryApi';
import PatientsApi from '../../api/PatientsApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export default function PaymentOperations() {
  const { token, hasRole } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [rate, setRate] = useState(null);
  const [loadingRate, setLoadingRate] = useState(true);

  const [cashStatus, setCashStatus] = useState(null);
  const [loadingCash, setLoadingCash] = useState(true);

  const [services, setServices] = useState([]);

  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingRate(true);
        const r = await ratesApi.getTodayRate(token);
        if (!mounted) return;
        setRate(r.data);
      } catch (e) {
        if (e?.response?.status === 404) setRate(null); else toast.error(e?.response?.data?.error || 'Error al cargar tasa');
      } finally { setLoadingRate(false); }
    })();

    (async () => {
      try {
        setLoadingCash(true);
        const s = await cashApi.getStatus(token);
        if (!mounted) return;
        setCashStatus(s.data);
      } catch (e) {
        toast.error(e?.response?.data?.error || 'Error al consultar caja');
      } finally { setLoadingCash(false); }
    })();

    (async () => {
      try {
        const res = await servicesApi.listServices(token);
        if (!mounted) return;
        setServices(res.data || []);
      } catch (e) { /* no-op */ }
    })();

    loadAccounts();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadAccounts = async (filters = {}) => {
    try {
      setAccountsLoading(true);
      const res = await accountsApi.listAccounts(filters, token);
      setAccounts(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Error al listar cuentas');
    } finally { setAccountsLoading(false); }
  };

  const handleRateCreate = async (rate_bcv) => {
    try {
      await ratesApi.createRate({ rate_bcv }, token);
      toast.success('Tasa del día registrada');
      const r = await ratesApi.getTodayRate(token);
      setRate(r.data);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'No se pudo crear la tasa');
    }
  };

  const refreshCash = async () => {
    try {
      const s = await cashApi.getStatus(token);
      setCashStatus(s.data);
    } catch (e) {
      /* ignore */
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Fila superior: Tasa del día y Caja, lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RateCard
            rate={rate}
            loading={loadingRate}
            canCreate={hasRole(['admin', 'recepcionista'])}
            onCreate={handleRateCreate}
          />
          <CashCard status={cashStatus} loading={loadingCash} onChanged={refreshCash} />
        </div>

        {/* Fila inferior: Cuentas y Detalle ocupando más espacio */}
        <div>
          <AccountsManager
            services={services}
            accounts={accounts}
            loading={accountsLoading}
            onReload={loadAccounts}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            rate={rate}
            cashOpen={cashStatus?.status === 'open'}
          />
        </div>
      </div>
    </div>
  );
}

function Card({ title, action, children }) {
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

function RateCard({ rate, loading, canCreate, onCreate }) {
  const [value, setValue] = useState('');
  return (
    <Card title="Tasa del día" action={null}>
      {loading ? (
        <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
      ) : rate ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">{Number(rate.rate_bcv).toFixed(2)} Bs/USD</div>
            <div className="text-xs text-gray-500">Fecha: {rate.rate_date}</div>
          </div>
          <div className="text-green-600 font-medium bg-green-50 border border-green-200 px-3 py-1 rounded-lg">Registrada</div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600">No hay tasa registrada para hoy. Registra la tasa BCV para habilitar cuentas y pagos.</p>
          {canCreate && (
            <form
              className="mt-3 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const v = parseFloat(value);
                if (!v || v <= 0) return;
                onCreate(v);
              }}
            >
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Ej: 40.50"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <button className="px-3 py-2 rounded-lg bg-gray-900 text-white">Registrar</button>
            </form>
          )}
        </div>
      )}
    </Card>
  );
}

function CashCard({ status, loading, onChanged }) {
  const { token } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const open = status?.status === 'open';
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);

  const [openForm, setOpenForm] = useState({ start_balance_usd: '', start_balance_bs: '' });
  const [closeForm, setCloseForm] = useState({ real_end_balance_usd: '', real_end_balance_bs: '', notes: '' });
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);

  // Load movements when session is open
  useEffect(()=>{
    let mounted = true;
    (async()=>{
      if(!open) { setMovements([]); return; }
      try {
        setMovementsLoading(true);
        const res = await cashApi.listMyMovements(token);
        if(!mounted) return;
        setMovements(res.data || []);
      } catch(e){ /* ignore */ } finally { setMovementsLoading(false); }
    })();
    return ()=>{ mounted = false; };
  }, [open, token, status?.session?.id]);

  const handleOpen = async () => {
    const ok = await confirm({ title: 'Abrir sesión de caja', message: '¿Deseas abrir la sesión de caja con los montos indicados?' });
    if (!ok) return;
    try {
      setOpening(true);
      await cashApi.openSession({ ...openForm }, token);
      toast.success('Sesión de caja abierta');
      setOpenForm({ start_balance_usd: '', start_balance_bs: '' });
      onChanged?.();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'No se pudo abrir la caja');
    } finally { setOpening(false); }
  };

  const handleClose = async () => {
    const ok = await confirm({ title: 'Cerrar sesión de caja', tone: 'danger', message: 'Al cerrar, se consolidarán los movimientos. ¿Confirmas?' });
    if (!ok) return;
    try {
      setClosing(true);
      await cashApi.closeSession({ ...closeForm }, token);
      toast.success('Sesión de caja cerrada');
      setCloseForm({ real_end_balance_usd: '', real_end_balance_bs: '', notes: '' });
      onChanged?.();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'No se pudo cerrar la caja');
    } finally { setClosing(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Top banner */}
      <div className="relative p-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm tracking-wide uppercase opacity-70">Sesión de caja</div>
            <div className="text-xl font-semibold flex items-center gap-2">
              {open ? 'Sesión abierta' : 'Caja cerrada'}
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${open?'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40':'bg-slate-500/20 text-slate-300 ring-1 ring-slate-400/40'}`}>{open?'Activa':'Inactiva'}</span>
            </div>
            {open && (
              <div className="text-xs opacity-80">Inicio: {status?.session?.opened_at} · Usuario #{status?.session?.user_id}</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!open && !loading && (
              <div className="flex gap-2">
                <input type="number" step="0.01" placeholder="USD inicial" className="bg-white/10 placeholder-white/40 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 w-32" value={openForm.start_balance_usd} onChange={(e)=>setOpenForm(f=>({...f,start_balance_usd:e.target.value}))} />
                <input type="number" step="0.01" placeholder="Bs inicial" className="bg-white/10 placeholder-white/40 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 w-32" value={openForm.start_balance_bs} onChange={(e)=>setOpenForm(f=>({...f,start_balance_bs:e.target.value}))} />
                <button disabled={opening} onClick={handleOpen} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-sm font-medium text-white shadow disabled:opacity-50">{opening?'Abriendo…':'Abrir caja'}</button>
              </div>
            )}
            {open && (
              <div className="flex gap-2 items-center">
                <input type="number" step="0.01" placeholder="USD real" className="bg-white/10 placeholder-white/40 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 w-28" value={closeForm.real_end_balance_usd} onChange={(e)=>setCloseForm(f=>({...f,real_end_balance_usd:e.target.value}))} />
                <input type="number" step="0.01" placeholder="Bs real" className="bg-white/10 placeholder-white/40 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 w-28" value={closeForm.real_end_balance_bs} onChange={(e)=>setCloseForm(f=>({...f,real_end_balance_bs:e.target.value}))} />
                <button disabled={closing} onClick={handleClose} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-sm font-medium text-white shadow disabled:opacity-50">{closing?'Cerrando…':'Cerrar caja'}</button>
              </div>
            )}
          </div>
        </div>
        {open && (
          <div className="mt-3">
            <textarea placeholder="Notas (opcional)" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40" rows={2} value={closeForm.notes} onChange={(e)=>setCloseForm(f=>({...f,notes:e.target.value}))} />
          </div>
        )}
      </div>

      {/* Balances (leave visually similar) */}
      {open && (
        <div className="px-5 pt-5 pb-3 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label="Apertura" valueBs={Number(status?.session?.start_balance_bs||0).toFixed(2)} valueUsd={Number(status?.session?.start_balance_usd||0).toFixed(2)} />
            <StatBox label="Movimientos" valueBs={Number(status?.session?.movements_bs||0).toFixed(2)} valueUsd={Number(status?.session?.movements_usd||0).toFixed(2)} />
            <StatBox label="Saldo estimado" valueBs={Number((status?.session?.start_balance_bs||0)+(status?.session?.movements_bs||0)).toFixed(2)} valueUsd={Number((status?.session?.start_balance_usd||0)+(status?.session?.movements_usd||0)).toFixed(2)} highlight />
            <div className="rounded-xl border border-gray-200 p-4 flex flex-col justify-center bg-gray-50">
              <div className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Movs</div>
              <div className="mt-1 text-xl font-semibold text-gray-800">{movements.length}</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Movimientos: suma neta de ingresos/egresos del día. Saldo estimado = Apertura + Movimientos.</p>
        </div>
      )}

      {/* Movements timeline */}
      {open && (
        <div className="px-5 pb-6 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-800">Movimientos</h4>
            <button onClick={()=>onChanged?.()} className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-gray-50">Refrescar</button>
          </div>
          <div className="max-h-72 overflow-y-auto pr-1 custom-scrollbar">
            {movementsLoading ? (
              <div className="h-24 bg-gray-50 animate-pulse rounded-lg" />
            ) : movements.length===0 ? (
              <div className="text-sm text-gray-500 py-6 text-center">Sin movimientos</div>
            ) : (
              <ul className="space-y-3">
                {movements.map(m => (
                  <li key={m.id} className="relative pl-6">
                    <span className={`absolute left-0 top-2 w-3 h-3 rounded-full ring-4 ring-white ${dotColor(m.movement_type)}`}></span>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="text-xs text-gray-500 font-medium">{m.created_at}</div>
                      <div className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">{m.movement_type}</div>
                    </div>
                    <div className="mt-0.5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-gray-800 font-medium">{m.description}</div>
                      <div className="flex gap-4 text-xs mt-1 sm:mt-0">
                        <span className="text-gray-600">Bs {Number(m.currency==='BS'?m.amount:0).toFixed(2)}</span>
                        <span className="text-gray-600">USD {Number(m.currency==='USD'?m.amount:(m.amount_usd||0)).toFixed(2)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!open && !loading && (
        <div className="p-6 bg-white">
          <div className="text-sm text-gray-600 mb-3">No hay sesión abierta. Abre una nueva para comenzar a registrar ingresos y egresos.</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input type="number" step="0.01" placeholder="USD inicial" className="border rounded-lg px-3 py-2 text-sm" value={openForm.start_balance_usd} onChange={(e)=>setOpenForm(f=>({...f,start_balance_usd:e.target.value}))} />
            <input type="number" step="0.01" placeholder="Bs inicial" className="border rounded-lg px-3 py-2 text-sm" value={openForm.start_balance_bs} onChange={(e)=>setOpenForm(f=>({...f,start_balance_bs:e.target.value}))} />
          </div>
          <button disabled={opening} onClick={handleOpen} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-50 shadow-sm hover:shadow">{opening?'Abriendo…':'Abrir caja'}</button>
        </div>
      )}
      {loading && (
        <div className="p-6 space-y-3">
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
          <div className="h-40 bg-gray-100 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}

function StatBox({ label, valueBs, valueUsd, highlight=false }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight?'bg-gray-900 text-white border-gray-800':'bg-gray-50 border-gray-200'} transition`}> 
      <div className={`text-[11px] uppercase tracking-wide font-medium ${highlight?'text-gray-300':'text-gray-500'}`}>{label}</div>
      <div className="mt-1 text-sm font-semibold flex flex-col">
        <span className={highlight?'text-gray-100':'text-gray-800'}>Bs {valueBs}</span>
        <span className={highlight?'text-gray-300 text-xs':'text-gray-500 text-xs'}>USD {valueUsd}</span>
      </div>
    </div>
  );
}

function dotColor(t){
  switch(t){
    case 'payment_in': return 'bg-emerald-500';
    case 'expense_out': return 'bg-rose-500';
    case 'adjustment_in': return 'bg-indigo-500';
    case 'adjustment_out': return 'bg-orange-500';
    case 'initial_balance': return 'bg-sky-500';
    default: return 'bg-gray-400';
  }
}

function AccountsManager({ services, accounts, loading, onReload, selectedAccount, setSelectedAccount, rate, cashOpen }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-1">
        <AccountsList accounts={accounts} loading={loading} onReload={onReload} onSelect={setSelectedAccount} />
      </div>
      <div className="xl:col-span-2">
        <AccountDetail
          account={selectedAccount}
          onAccountLoaded={(acc) => setSelectedAccount(acc)}
          services={services}
          rate={rate}
          cashOpen={cashOpen}
        />
      </div>
    </div>
  );
}

function AccountsList({ accounts, loading, onReload, onSelect }) {
  const { token } = useAuth();
  const toast = useToast();
  const [filters, setFilters] = useState({ q: '', status: '' });
  const [creating, setCreating] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [payerQuery, setPayerQuery] = useState('');
  const [patientSel, setPatientSel] = useState(null);
  const [payerSel, setPayerSel] = useState(null);
  const [suggestions, setSuggestions] = useState({ patients: [], payers: [] });

  useEffect(() => { onReload(); /* eslint-disable-next-line */ }, []);

  const searchPatients = async (term, key) => {
    if (!term || term.length < 2) {
      setSuggestions((s) => ({ ...s, [key]: [] }));
      return;
    }
    try {
      const res = await PatientsApi.search({ q: term, limit: 5 }, token);
      setSuggestions((s) => ({ ...s, [key]: res.data || [] }));
    } catch (e) { /* ignore */ }
  };

  const handleCreate = async () => {
    if (!patientSel || !payerSel) return toast.warning('Selecciona paciente y pagador');
    try {
      setCreating(true);
      const res = await accountsApi.createAccount({ patient_id: patientSel.id, payer_patient_id: payerSel.id }, token);
      toast.success('Cuenta creada');
      await onReload();
      const acc = await accountsApi.getAccount(res.data.id, token);
      onSelect(acc.data);
      setPatientQuery(''); setPayerQuery(''); setPatientSel(null); setPayerSel(null); setSuggestions({ patients: [], payers: [] });
    } catch (e) {
      toast.error(e?.response?.data?.error || 'No se pudo crear la cuenta');
    } finally { setCreating(false); }
  };

  return (
    <Card title="Cuentas" action={<button onClick={() => onReload()} className="text-sm px-3 py-1.5 rounded-lg border">Refrescar</button>}>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Nueva cuenta</div>
          <div className="space-y-2">
            <div>
              <input value={patientQuery} onChange={(e)=>{setPatientQuery(e.target.value); searchPatients(e.target.value, 'patients');}} placeholder="Buscar paciente (nombre, cédula)" className="w-full border rounded-lg px-3 py-2 text-sm" />
              {suggestions.patients.length > 0 && (
                <div className="mt-1 border rounded-lg bg-white shadow max-h-40 overflow-auto">
                  {suggestions.patients.map(p => (
                    <button key={p.id} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{setPatientSel(p); setPatientQuery(`${p.full_name || p.first_name+" "+p.last_name} (${p.cedula||p.dni})`); setSuggestions(s=>({...s,patients:[]}));}}>
                      {(p.full_name || (p.first_name+" "+p.last_name))} · {p.cedula || p.dni}
                    </button>
                  ))}
                </div>
              )}
              {patientSel && <div className="text-xs text-gray-600 mt-1">Paciente: {patientSel.full_name || (patientSel.first_name+" "+patientSel.last_name)}</div>}
            </div>
            <div>
              <input value={payerQuery} onChange={(e)=>{setPayerQuery(e.target.value); searchPatients(e.target.value, 'payers');}} placeholder="Buscar pagador (nombre, cédula)" className="w-full border rounded-lg px-3 py-2 text-sm" />
              {suggestions.payers.length > 0 && (
                <div className="mt-1 border rounded-lg bg-white shadow max-h-40 overflow-auto">
                  {suggestions.payers.map(p => (
                    <button key={p.id} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{setPayerSel(p); setPayerQuery(`${p.full_name || p.first_name+" "+p.last_name} (${p.cedula||p.dni})`); setSuggestions(s=>({...s,payers:[]}));}}>
                      {(p.full_name || (p.first_name+" "+p.last_name))} · {p.cedula || p.dni}
                    </button>
                  ))}
                </div>
              )}
              {payerSel && <div className="text-xs text-gray-600 mt-1">Pagador: {payerSel.full_name || (payerSel.first_name+" "+payerSel.last_name)}</div>}
            </div>
            <div className="flex justify-end">
              <button disabled={creating} onClick={handleCreate} className="px-3 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-60">{creating?'Creando…':'Crear cuenta'}</button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select className="border rounded-lg px-3 py-2 text-sm" value={filters.status} onChange={(e)=>setFilters(f=>({...f,status:e.target.value}))}>
            <option value="">Todas</option>
            <option value="open">Abiertas</option>
            <option value="paid">Pagadas</option>
            <option value="cancelled">Anuladas</option>
          </select>
          <button onClick={()=>onReload({ status: filters.status||undefined })} className="px-3 py-2 rounded-lg border">Filtrar</button>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Paciente</th>
                <th className="text-left p-2">Total</th>
                <th className="text-left p-2">Pagado</th>
                <th className="text-left p-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Cargando…</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Sin resultados</td></tr>
              ) : accounts.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 cursor-pointer" onClick={async()=>{
                  try{ const r = await accountsApi.getAccount(a.id, token); onSelect(r.data); } catch (e) {}
                }}>
                  <td className="p-2">#{a.id}</td>
                  <td className="p-2">{a.patient_name || a.patient_full_name || a.patient_id}</td>
                  <td className="p-2">${'{'}a.total_usd{'}'}.00 / {a.total_bs?.toFixed ? a.total_bs.toFixed(2): a.total_bs} Bs</td>
                  <td className="p-2">${'{'}a.paid_usd{'}'}.00</td>
                      <td className="p-2"><span className={`px-2 py-0.5 rounded text-xs ${badgeForStatus(a.status)}`}>{labelAccountStatus(a.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

function badgeForStatus(s){
  return s==='paid'? 'bg-emerald-100 text-emerald-700' : s==='cancelled'? 'bg-red-100 text-red-700' : s==='partially_paid'? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700';
}

function labelAccountStatus(s){
  switch(s){
    case 'pending': return 'Pendiente';
    case 'partially_paid': return 'Parcialmente pagada';
    case 'paid': return 'Pagada';
    case 'cancelled': return 'Anulada';
    default: return s;
  }
}

function labelPaymentStatus(s){
  switch(s){
    case 'pending_verification': return 'Pendiente de verificación';
    case 'verified': return 'Verificado';
    case 'rejected': return 'Rechazado';
    default: return s;
  }
}

function AccountDetail({ account, onAccountLoaded, services, rate, cashOpen }) {
  const { token, hasRole } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [adding, setAdding] = useState(false);
  const [serviceId, setServiceId] = useState('');
  const [qty, setQty] = useState(1);
  // Supplies
  const [items, setItems] = useState([]);
  const [itemId, setItemId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [addingSupply, setAddingSupply] = useState(false);
  // UI: selector dinámico entre servicio/insumo
  const [addMode, setAddMode] = useState('service'); // 'service' | 'supply'
  const [payLoading, setPayLoading] = useState(false);
  const [payment, setPayment] = useState({ payment_method: 'cash_bs', currency: 'BS', amount: '', reference_number: '', notes: '', attachment: null });
  const canEdit = account && (account.status === 'pending' || account.status === 'partially_paid');

  const reload = async () => {
    if (!account) return;
    const r = await accountsApi.getAccount(account.id, token);
    onAccountLoaded(r.data);
  };

  const addDetail = async () => {
    if (!serviceId) return;
    try {
      setAdding(true);
      await accountsApi.addDetail(account.id, { service_id: serviceId, quantity: qty }, token);
      await reload();
      toast.success('Detalle agregado');
      setServiceId(''); setQty(1);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'No se pudo agregar');
    } finally { setAdding(false); }
  };

  // Load inventory once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await inventoryApi.listInventory({ }, token);
        if (!mounted) return;
        setItems((res.data || []).filter(i => i.is_active === 1 || i.is_active === true));
      } catch (e) { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [token]);

  const addSupply = async () => {
    if (!itemId) return;
    try {
      setAddingSupply(true);
      await accountsApi.addSupply(account.id, { item_id: itemId, quantity: itemQty }, token);
      await reload();
      toast.success('Insumo agregado');
      setItemId(''); setItemQty(1);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'No se pudo agregar el insumo');
    } finally { setAddingSupply(false); }
  };

  const removeSupply = async (supplyId) => {
    const ok = await confirm({ title: 'Eliminar insumo', tone: 'danger', message: 'Esta acción no se puede deshacer.' });
    if (!ok) return;
    try {
      await accountsApi.removeSupply(supplyId, token);
      await reload();
      toast.success('Insumo eliminado');
    } catch (e) { toast.error(e?.response?.data?.error || 'No se pudo eliminar'); }
  };

  const removeDetail = async (detailId) => {
    const ok = await confirm({ title: 'Eliminar detalle', tone: 'danger', message: 'Esta acción no se puede deshacer.' });
    if (!ok) return;
    try {
      await accountsApi.removeDetail(detailId, token);
      await reload();
      toast.success('Detalle eliminado');
    } catch (e) { toast.error(e?.response?.data?.error || 'No se pudo eliminar'); }
  };

  const onFileChange = (e) => setPayment((p)=>({ ...p, attachment: e.target.files?.[0] || null }));

  const submitPayment = async () => {
    if (!account) return;
    if (!rate) return toast.warning('Debe registrar la tasa del día');
    if (!payment.amount || payment.amount <= 0) return toast.warning('Monto inválido');
    if (payment.payment_method.startsWith('cash') && !cashOpen) {
      return toast.warning('Abre la caja para registrar pagos en efectivo');
    }
    try {
      setPayLoading(true);
      // Asegurar moneda: solo "Efectivo USD" usa USD; el resto es Bs
      const enforcedCurrency = payment.payment_method === 'cash_usd' ? 'USD' : 'BS';
      const payload = { ...payment, currency: enforcedCurrency };
      const form = new FormData();
      Object.entries(payload).forEach(([k,v])=>{ if (k==='attachment'){ if(v) form.append('attachment', v); } else form.append(k, v); });
      const res = await paymentsApi.createPayment(account.id, form, token);
      if (!res?.data || typeof res.data.id === 'undefined') {
        console.error('Respuesta inesperada al registrar pago:', res?.data);
        throw new Error('La API no confirmó el registro del pago');
      }
      console.log('Pago registrado (API):', res.data);
      toast.success('Pago registrado');
      await reload();
    } catch (e) {
      console.error('Error registrando pago:', e?.response?.data || e);
      toast.error(e?.response?.data?.error || 'No se pudo registrar el pago');
    } finally { setPayLoading(false); }
  };

  const generateReceipt = async () => {
    try {
      const r = await receiptsApi.generateReceipt(account.id, token);
      toast.success(`Recibo generado ${r.data?.receipt_number || ''}`);
    } catch (e) { toast.error(e?.response?.data?.error || 'No se pudo generar recibo'); }
  };

  if (!account) return (
    <Card title="Detalle" action={null}>
      <div className="text-sm text-gray-600">Selecciona una cuenta para ver sus detalles, agregar servicios y registrar pagos.</div>
    </Card>
  );

  return (
    <div className="space-y-3">
      <Card title={`Cuenta #${account.id}`} action={
        account.status==='paid' ? <button onClick={generateReceipt} className="px-3 py-1.5 rounded-lg border">Generar recibo</button> : null
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Paciente:</span> <span className="font-medium">{account.patient_full_name || account.patient_name || account.patient_id}</span></div>
          <div><span className="text-gray-500">Estado:</span> <span className={`px-2 py-0.5 rounded text-xs ${badgeForStatus(account.status)}`}>{labelAccountStatus(account.status)}</span></div>
          <div><span className="text-gray-500">Tasa:</span> <span className="font-medium">{account.rate_bcv} Bs/USD</span></div>
          <div><span className="text-gray-500">Total:</span> <span className="font-medium">{Number(account.total_usd||0).toFixed(2)} USD / {Number(account.total_bs||0).toFixed(2)} Bs</span></div>
        </div>
      </Card>

      <Card title="Cargar a la cuenta" action={canEdit && (
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border overflow-hidden">
            <button type="button" className={`px-3 py-2 text-sm ${addMode==='service'?'bg-gray-900 text-white':'bg-white'}`} onClick={()=>setAddMode('service')}>Servicio</button>
            <button type="button" className={`px-3 py-2 text-sm ${addMode==='supply'?'bg-gray-900 text-white':'bg-white'}`} onClick={()=>setAddMode('supply')}>Insumo</button>
          </div>
          {addMode==='service' ? (
            <>
              <select className="border rounded-lg px-3 py-2 text-sm" value={serviceId} onChange={(e)=>setServiceId(e.target.value)}>
                <option value="">Servicio…</option>
                {services.filter(s=>s.is_active===1 || s.is_active===true).map(s=> (
                  <option key={s.id} value={s.id}>{s.name} · ${'{'}Number(s.price_usd).toFixed(2){'}'} USD</option>
                ))}
              </select>
              <input type="number" min="1" className="w-24 border rounded-lg px-2 py-2 text-sm" value={qty} onChange={(e)=>setQty(Number(e.target.value)||1)} />
              <button disabled={!serviceId || adding} onClick={addDetail} className="px-3 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60">{adding?'Agregando…':'Agregar servicio'}</button>
            </>
          ) : (
            <>
              <select className="border rounded-lg px-3 py-2 text-sm" value={itemId} onChange={(e)=>setItemId(e.target.value)}>
                <option value="">Insumo…</option>
                {items.map(it => {
                  const usd = Number(it.price_usd||0);
                  const bs = Number((usd * Number(account?.rate_bcv||0)).toFixed(2));
                  return (
                    <option key={it.id} value={it.id}>{it.name} · ${'{'}usd.toFixed(2){'}'} USD · {bs.toFixed?bs.toFixed(2):bs} Bs · Stock {it.stock_quantity} {it.unit_of_measure || ''}</option>
                  );
                })}
              </select>
              <input type="number" min="1" className="w-24 border rounded-lg px-2 py-2 text-sm" value={itemQty} onChange={(e)=>setItemQty(Number(e.target.value)||1)} />
              <button disabled={!itemId || addingSupply} onClick={addSupply} className="px-3 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60">{addingSupply?'Agregando…':'Agregar insumo'}</button>
            </>
          )}
        </div>
      )}>
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-2">Servicio</th>
                <th className="text-right p-2">Cant.</th>
                <th className="text-right p-2">USD</th>
                <th className="text-right p-2">Bs</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {(account.details||[]).length===0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Sin detalles</td></tr>
              ) : account.details.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="p-2">{d.service_name}</td>
                  <td className="p-2 text-right">{d.quantity}</td>
                  <td className="p-2 text-right">{Number(d.price_usd).toFixed(2)} USD</td>
                  <td className="p-2 text-right">{Number(d.price_bs * d.quantity).toFixed(2)} Bs</td>
                  <td className="p-2 text-right">
                    {canEdit && (
                      <button onClick={()=>removeDetail(d.id)} className="px-2 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-200">Eliminar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Insumos cargados" action={null}>
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-2">Insumo</th>
                <th className="text-right p-2">Cant.</th>
                <th className="text-right p-2">USD</th>
                <th className="text-right p-2">Bs</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {(account.supplies||[]).length===0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Sin insumos</td></tr>
              ) : account.supplies.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-2">{s.description}</td>
                  <td className="p-2 text-right">{s.quantity}</td>
                  <td className="p-2 text-right">{Number(s.total_price_usd ?? (s.price_usd*s.quantity)).toFixed(2)} USD</td>
                  <td className="p-2 text-right">{Number(s.total_price_bs ?? (s.price_bs*s.quantity)).toFixed(2)} Bs</td>
                  <td className="p-2 text-right">
                    {canEdit && (
                      <button onClick={()=>removeSupply(s.id)} className="px-2 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-200">Eliminar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Pagos" action={null}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Registrar pago</div>
            {!(account.status==='pending' || account.status==='partially_paid') && <div className="text-xs text-red-600">La cuenta no admite pagos en su estado actual.</div>}
            {!cashOpen && payment.payment_method.startsWith('cash') && <div className="text-xs text-amber-600">Abre la caja para pagos en efectivo.</div>}
            <div className="grid grid-cols-2 gap-2">
              <select className="border rounded-lg px-3 py-2 text-sm" value={payment.payment_method} onChange={(e)=>{
                const method = e.target.value;
                const currency = method === 'cash_usd' ? 'USD' : 'BS';
                setPayment(p=>({...p,payment_method:method, currency}));
              }}>
                <option value="cash_bs">Efectivo Bs</option>
                <option value="cash_usd">Divisas (efectivo)</option>
                <option value="transfer_bs">Transferencia Bs</option>
                <option value="mobile_payment_bs">Pago móvil Bs</option>
              </select>
              <input type="number" step="0.01" placeholder="Monto" className="border rounded-lg px-3 py-2 text-sm" value={payment.amount} onChange={(e)=>setPayment(p=>({...p,amount:e.target.value}))} />
              <input placeholder="Referencia (si aplica)" className="border rounded-lg px-3 py-2 text-sm" value={payment.reference_number} onChange={(e)=>setPayment(p=>({...p,reference_number:e.target.value}))} />
              <input type="file" onChange={onFileChange} className="col-span-2 text-sm" />
              <textarea placeholder="Notas" className="col-span-2 border rounded-lg px-3 py-2 text-sm" value={payment.notes} onChange={(e)=>setPayment(p=>({...p,notes:e.target.value}))}></textarea>
            </div>
            <div className="flex justify-end">
              <button disabled={payLoading || !(account.status==='pending' || account.status==='partially_paid')} onClick={submitPayment} className="px-3 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-60">{payLoading?'Registrando…':'Registrar pago'}</button>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Pagos registrados</div>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Método</th>
                    <th className="text-right p-2">Monto</th>
                    <th className="text-left p-2">Moneda</th>
                    <th className="text-left p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {(account.payments||[]).length===0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-gray-500">Sin pagos</td></tr>
                  ) : account.payments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-2">{p.created_at}</td>
                      <td className="p-2">{p.payment_method}</td>
                      <td className="p-2 text-right">{Number(p.amount).toFixed(2)}</td>
                      <td className="p-2">{p.currency}</td>
                      <td className="p-2">{labelPaymentStatus(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
