import React, { useEffect, useMemo, useState } from 'react';
import * as cashApi from '../../api/cashregister';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

function StatusBadge({ status }){
  const map = {
    open: { label: 'Abierta', cls: 'bg-emerald-100 text-emerald-700' },
    closed: { label: 'Cerrada', cls: 'bg-gray-100 text-gray-700' },
    no_open_session: { label: 'Sin sesión abierta', cls: 'bg-gray-100 text-gray-700' }
  };
  const m = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-1 rounded text-xs ${m.cls}`}>{m.label}</span>;
}

export default function CashManager(){
  const { token, user } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('closed');
  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openingBs, setOpeningBs] = useState('');
  const [openingUsd, setOpeningUsd] = useState('');
  const [note, setNote] = useState('');

  // lock background scroll when modal is open
  useEffect(()=>{
    if(openModal){
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  },[openModal]);

  const canOpen = useMemo(()=>status !== 'open', [status]);
  const canClose = useMemo(()=>status === 'open', [status]);

  const load = async()=>{
    try{
      setLoading(true);
      const s = await cashApi.getStatus(token);
      setStatus(s?.data?.status || 'closed');
      setSession(s?.data?.session || null);
      const m = await cashApi.listMyMovements(token);
      setMovs(m.data || []);
    }catch(e){
      setSession(null); setMovs([]);
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);

  const openSession = async()=>{
    // open small modal to collect optional data
    setOpenModal(true);
  };

  const submitOpen = async(e)=>{
    e?.preventDefault?.();
    const payload = {};
    const bs = parseFloat(openingBs);
    const usd = parseFloat(openingUsd);
    // Backend expects start_balance_bs / start_balance_usd
    if(!isNaN(bs) && bs>0) payload.start_balance_bs = bs;
    if(!isNaN(usd) && usd>0) payload.start_balance_usd = usd;
    // notes en apertura no está soportado actualmente

    const ok = await confirm({ title: 'Abrir caja', message: 'Se abrirá la caja con los valores indicados. ¿Continuar?', tone: 'info', confirmText: 'Abrir', cancelText: 'Cancelar' });
    if(!ok) return;
    try{
      await cashApi.openSession(payload, token);
      toast.success('Caja abierta');
      setOpenModal(false); setOpeningBs(''); setOpeningUsd(''); setNote('');
      load();
    }catch(e){ toast.error(e?.response?.data?.error || 'No se pudo abrir'); }
  };

  const closeSession = async()=>{
    const ok = await confirm({ title: 'Cerrar caja', message: 'Se cerrará la caja actual. Puedes abrir una nueva más tarde.', tone: 'warning', confirmText: 'Cerrar', cancelText: 'Cancelar' });
    if(!ok) return;
    try{
  await cashApi.closeSession({}, token);
      toast.success('Caja cerrada');
      load();
    }catch(e){ toast.error(e?.response?.data?.error || 'No se pudo cerrar'); }
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-900">Caja</h2>
      <p className="text-sm text-gray-600">Gestiona la sesión de caja y revisa movimientos.</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:col-span-1">
          {loading ? (
            <div className="h-24 bg-gray-100 rounded animate-pulse" />
          ) : (
            <div className="space-y-2">
              {(() => {
                const d = deriveSessionMetrics(session, movs);
                const displayName = [user?.first_name || user?.firstName, user?.last_name || user?.lastName].filter(Boolean).join(' ') || user?.name || user?.email || (session?.user_id ? `ID ${session.user_id}` : '-');
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Estado</div>
                      <StatusBadge status={status || 'closed'} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Usuario</span>
                      <span className="text-gray-900">{displayName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Inicio</span>
                      <span className="text-gray-900">{d.openedAt ? formatDateTime(d.openedAt) : '-'}</span>
                    </div>
                  </>
                );
              })()}

              <div className="pt-2 flex gap-2">
                {canOpen && (
                  <button onClick={openSession} className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm">Abrir caja</button>
                )}
                {canClose && (
                  <button onClick={closeSession} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm">Cerrar caja</button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:col-span-2">
          {/* resumen */}
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium">Resumen de sesión</h3>
          </div>
          <SummaryBar session={session} movs={movs} />
          <p className="text-xs text-gray-600 mt-1">Movimientos: suma neta de ingresos/egresos del día (sin contar apertura ni cierre). Saldo estimado = Apertura + Movimientos.</p>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Movimientos</h3>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-2 py-1">Fecha</th>
                  <th className="px-2 py-1">Tipo</th>
                  <th className="px-2 py-1">Descripción</th>
                  <th className="px-2 py-1 text-right">Monto Bs</th>
                  <th className="px-2 py-1 text-right">Monto USD</th>
                </tr>
              </thead>
              <tbody>
                {movs.length === 0 ? (
                  <tr><td colSpan={5} className="px-2 py-4 text-center text-gray-500">Sin movimientos</td></tr>
                ) : movs.map(m => (
                  <tr key={m.id} className="border-t">
                    <td className="px-2 py-1">{formatDateTime(m.created_at)}</td>
                    <td className="px-2 py-1">{mapMovementType(m.movement_type)}</td>
                    <td className="px-2 py-1">{m.description}</td>
                    <td className="px-2 py-1 text-right">{Number(m.currency === 'BS' ? m.amount : 0).toFixed(2)}</td>
                    <td className="px-2 py-1 text-right">{Number(m.currency === 'USD' ? m.amount : 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={()=>setOpenModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-3">
              <div className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">Abrir caja</div>
              <button onClick={()=>setOpenModal(false)} className="ml-auto p-1 rounded hover:bg-black/5">
                <span className="text-gray-500">✕</span>
              </button>
            </div>
            <form onSubmit={submitOpen} className="mt-3 space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Monto inicial Bs (opcional)</label>
                <input type="number" step="0.01" min="0" value={openingBs} onChange={(e)=>setOpeningBs(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Monto inicial USD (opcional)</label>
                <input type="number" step="0.01" min="0" value={openingUsd} onChange={(e)=>setOpeningUsd(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nota (opcional)</label>
                <textarea value={note} onChange={(e)=>setNote(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Observaciones" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={()=>setOpenModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Abrir</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateTime(dt){
  if(!dt) return '';
  try{
    const norm = typeof dt === 'string' && dt.includes(' ') && !dt.includes('T') ? dt.replace(' ', 'T') : dt;
    const d = new Date(norm);
    if(Number.isNaN(d.getTime())) return dt;
    return d.toLocaleString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' });
  }catch{ return dt; }
}

function deriveSessionMetrics(session, movs){
  // Apertura desde la sesión
  const openingBs = Number(session?.start_balance_bs ?? 0);
  const openingUsd = Number(session?.start_balance_usd ?? 0);

  // Sumar movimientos netos por moneda (excluyendo 'initial_balance')
  const sums = (movs||[]).reduce((acc,m)=>{
    if(m?.movement_type === 'initial_balance') return acc; // ya está incluido como apertura
    const sign = (m?.movement_type === 'payment_in' || m?.movement_type === 'adjustment_in') ? 1
                : (m?.movement_type === 'expense_out' || m?.movement_type === 'adjustment_out') ? -1
                : 0;
    if(m?.currency === 'BS') acc.bs += sign * Number(m.amount || 0);
    if(m?.currency === 'USD') acc.usd += sign * Number(m.amount || 0);
    return acc;
  },{ bs:0, usd:0 });

  const balanceBs = openingBs + sums.bs;
  const balanceUsd = openingUsd + sums.usd;

  const openedAt = session?.start_time || null;

  return { openingBs, openingUsd, sumBs: sums.bs, sumUsd: sums.usd, balanceBs, balanceUsd, openedAt };
}

function SummaryBar({ session, movs }){
  const d = deriveSessionMetrics(session, movs);
  const items = [
    { label: 'Apertura', value: `Bs ${d.openingBs.toFixed(2)} · USD ${d.openingUsd.toFixed(2)}` },
    { label: 'Movimientos', value: `Bs ${d.sumBs.toFixed(2)} · USD ${d.sumUsd.toFixed(2)}` },
    { label: 'Saldo estimado', value: `Bs ${d.balanceBs.toFixed(2)} · USD ${d.balanceUsd.toFixed(2)}` },
    { label: 'Cantidad de movs', value: String(movs.length) },
  ];
  return (
    <div className="mb-3 grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map((it,i)=>(
        <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs text-gray-600">{it.label}</div>
          <div className="text-sm font-medium text-gray-900">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

function mapMovementType(t){
  const map = {
    payment_in: 'Ingreso (pago)',
    expense_out: 'Egreso',
    adjustment_in: 'Ajuste (+)',
    adjustment_out: 'Ajuste (-)',
    initial_balance: 'Apertura'
  };
  return map[t] || t;
}
