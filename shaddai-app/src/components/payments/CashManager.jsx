import React, { useEffect, useMemo, useState } from 'react';
import * as cashApi from '../../api/cashregister';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { 
  Wallet, 
  RefreshCw, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  MinusCircle, 
  PlusCircle, 
  Info,
  History,
  Lock,
  Unlock,
  User,
  Clock,
  CircleDollarSign,
  X
} from 'lucide-react';

function StatusBadge({ status }){
  const map = {
    open: { label: 'Abierta', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    closed: { label: 'Cerrada', cls: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200' },
    no_open_session: { label: 'Sin sesión', cls: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200' }
  };
  const m = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${m.cls}`}>{m.label}</span>;
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
    setOpenModal(true);
  };

  const submitOpen = async(e)=>{
    e?.preventDefault?.();
    const payload = {};
    const bs = parseFloat(openingBs);
    const usd = parseFloat(openingUsd);
    
    if(!isNaN(bs) && bs>0) payload.start_balance_bs = bs;
    if(!isNaN(usd) && usd>0) payload.start_balance_usd = usd;
    
    const ok = await confirm({ title: 'Confirmar Apertura', message: 'Se iniciará una nueva sesión de caja con los valores indicados. ¿Desea continuar?', tone: 'info', confirmText: 'Abrir Caja', cancelText: 'Cancelar' });
    if(!ok) return;
    try{
      await cashApi.openSession(payload, token);
      toast.success('Sesión de caja iniciada');
      setOpenModal(false); setOpeningBs(''); setOpeningUsd(''); setNote('');
      load();
    }catch(e){ toast.error(e?.response?.data?.error || 'Error al abrir caja'); }
  };

  const closeSession = async()=>{
    const ok = await confirm({ title: 'Cerrar Caja', message: 'Esta acción finalizará la sesión actual. Se recomienda verificar el saldo antes de cerrar.', tone: 'warning', confirmText: 'Cerrar Sesión', cancelText: 'Cancelar' });
    if(!ok) return;
    try{
      await cashApi.closeSession({}, token);
      toast.success('Sesión cerrada correctamente');
      load();
    }catch(e){ toast.error(e?.response?.data?.error || 'Error al cerrar caja'); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-900 rounded-xl text-white">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Control de Caja</h2>
            <p className="text-sm text-gray-500">Gestión de turnos y supervisión de flujo de efectivo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={load} 
             className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
             title="Actualizar datos"
           >
             <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Session Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/50">
            {/* Ambient Background */}
            <div className={`absolute inset-0 opacity-10 ${status === 'open' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
            
            <div className="relative p-6">
              <div className="flex justify-between items-start mb-6">
                <StatusBadge status={status} />
                {status === 'open' ? (
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                ) : (
                   <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>

              <div className="space-y-4">
                {loading ? (
                   <div className="space-y-3 animate-pulse">
                     <div className="h-4 bg-gray-100 rounded w-1/2" />
                     <div className="h-8 bg-gray-100 rounded w-3/4" />
                     <div className="h-4 bg-gray-100 rounded w-1/3" />
                   </div>
                ) : (
                   <>
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-white/50 backdrop-blur rounded-lg">
                         <User className="w-5 h-5 text-gray-700" />
                       </div>
                       <div>
                         <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Responsable</div>
                         <div className="font-semibold text-gray-900 truncate max-w-[200px]">
                           {status === 'open' 
                             ? [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email 
                             : '---'
                           }
                         </div>
                       </div>
                     </div>

                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-white/50 backdrop-blur rounded-lg">
                         <Clock className="w-5 h-5 text-gray-700" />
                       </div>
                       <div>
                         <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Apertura</div>
                         <div className="font-semibold text-gray-900">
                           {formatDateTime(session?.opened_at || session?.start_time)}
                         </div>
                       </div>
                     </div>
                   </>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100/50">
                 {status !== 'open' ? (
                   <div className="space-y-4">
                     <p className="text-sm text-gray-500">Inicia una nueva sesión para comenzar a registrar operaciones.</p>
                     
                     {/* Mini inputs for quick open */}
                     <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                         <label className="text-[10px] uppercase font-bold text-gray-400">USD Inicial</label>
                         <input 
                           type="number" 
                           placeholder="0.00" 
                           value={openingUsd} 
                           onChange={(e)=>setOpeningUsd(e.target.value)}
                           className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                         />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] uppercase font-bold text-gray-400">Bs Inicial</label>
                         <input 
                           type="number" 
                           placeholder="0.00" 
                           value={openingBs} 
                           onChange={(e)=>setOpeningBs(e.target.value)}
                           className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                         />
                       </div>
                     </div>

                     <button 
                       onClick={submitOpen}
                       className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium shadow-lg shadow-gray-900/10 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                     >
                       <Unlock className="w-4 h-4" />
                       Abrir Caja
                     </button>
                   </div>
                 ) : (
                   <button 
                     onClick={closeSession}
                     className="w-full py-3 bg-white border border-gray-200 text-red-600 rounded-xl font-medium hover:bg-red-50 hover:border-red-100 transition-all flex justify-center items-center gap-2"
                   >
                     <Lock className="w-4 h-4" />
                     Cerrar Turno
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Movements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats Grid */}
          <SummaryCards session={session} movs={movs} />

          {/* Movements List */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[400px] lg:h-[500px]">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-400" />
                Historial de Movimientos
              </h3>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                {movs.length} registros
              </span>
            </div>

            <div className="overflow-y-auto flex-1 p-4 scroll-smooth">
              {movs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                    <CircleDollarSign className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium">No se han registrado movimientos en esta sesión</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {movs.map((m, i) => (
                    <MovementItem key={m.id || i} movement={m} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal is effectively replaced by inline form, but keeping logic just in case user uses the separate button later */}
      {openModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-gray-900/20 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Apertura Manual</h3>
              <button onClick={()=>setOpenModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={submitOpen} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Base Bs</label>
                  <input type="number" step="0.01" value={openingBs} onChange={(e)=>setOpeningBs(e.target.value)} className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 px-4 py-3 outline-none transition-all" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Base USD</label>
                  <input type="number" step="0.01" value={openingUsd} onChange={(e)=>setOpeningUsd(e.target.value)} className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 px-4 py-3 outline-none transition-all" placeholder="0.00" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Notas</label>
                <textarea rows={3} value={note} onChange={(e)=>setNote(e.target.value)} className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 px-4 py-3 outline-none transition-all resize-none" placeholder="Observaciones de apertura..." />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={()=>setOpenModal(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-gray-900 text-white font-medium rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function SummaryCards({ session, movs }){
  const d = deriveSessionMetrics(session, movs);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <StatBox label="Fondo Inicial" valueBs={d.openingBs} valueUsd={d.openingUsd} icon={Wallet} tone="gray" />
      <StatBox label="Actividad Neta" valueBs={d.sumBs} valueUsd={d.sumUsd} icon={ActivityIcon} tone="blue" />
      <StatBox label="Saldo en Caja" valueBs={d.balanceBs} valueUsd={d.balanceUsd} icon={CircleDollarSign} tone="emerald" highlight />
    </div>
  );
}

function StatBox({ label, valueBs, valueUsd, icon: Icon, tone, highlight }){
  const tones = {
    gray: 'bg-gray-50 text-gray-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };
  const t = tones[tone] || tones.gray;

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 ${highlight ? 'bg-gray-900 border-gray-900 text-white shadow-lg transform hover:-translate-y-1' : 'bg-white border-gray-100 text-gray-900 hover:shadow-md'}`}>
      <div className="flex items-center gap-2 mb-3 opacity-80">
        <Icon className={`w-4 h-4 ${highlight ? 'text-white' : ''}`} />
        <span className="text-xs font-semibold uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="space-y-1">
        <div className={`text-lg font-bold truncate ${highlight ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xs font-normal opacity-60 mr-1">Bs</span>
          {valueBs.toFixed(2)}
        </div>
        <div className={`text-sm font-medium truncate ${highlight ? 'text-white/80' : 'text-gray-500'}`}>
          <span className="text-xs font-normal opacity-60 mr-1">USD</span>
          {valueUsd.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

function MovementItem({ movement }){
  const isPositive = ['payment_in', 'adjustment_in', 'initial_balance'].includes(movement.movement_type);
  const isNeutral = movement.movement_type === 'initial_balance';
  
  const Icon = isNeutral ? Info : (isPositive ? ArrowDownCircle : ArrowUpCircle); // In is down (into box), Out is up (out of box) - metaphorically
  
  // Color logic
  const colors = {
    payment_in: 'text-emerald-500 bg-emerald-50',
    expense_out: 'text-rose-500 bg-rose-50',
    adjustment_in: 'text-indigo-500 bg-indigo-50',
    adjustment_out: 'text-orange-500 bg-orange-50',
    initial_balance: 'text-sky-500 bg-sky-50'
  };
  const c = colors[movement.movement_type] || 'text-gray-500 bg-gray-50';

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
      <div className={`p-3 rounded-full ${c} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-gray-900 text-sm truncate pr-2">{movement.movement_type === 'payment_in' ? 'Pago Recibido' : mapMovementType(movement.movement_type)}</h4>
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
            {formatDateTime(movement.created_at, true)}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">{movement.description || 'Sin descripción'}</p>
      </div>

      <div className="text-right shrink-0">
        <div className={`font-bold text-sm ${isPositive ? 'text-emerald-600' : 'text-gray-900'}`}>
          {isPositive ? '+' : '-'} {Number(movement.amount).toFixed(2)} <span className="text-[10px] text-gray-400 font-normal">{movement.currency}</span>
        </div>
      </div>
    </div>
  );
}

// Helpers
function ActivityIcon(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  )
}

function formatDateTime(dt, timeOnly = false){
  if(!dt) return '---';
  try{
    const norm = typeof dt === 'string' && dt.includes(' ') && !dt.includes('T') ? dt.replace(' ', 'T') : dt;
    const d = new Date(norm);
    if(Number.isNaN(d.getTime())) return dt;
    if(timeOnly) return d.toLocaleTimeString('es-VE', {hour: '2-digit', minute:'2-digit'});
    return d.toLocaleString('es-VE', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' });
  }catch{ return dt; }
}

function mapMovementType(t){
  const map = {
    payment_in: 'Ingreso',
    expense_out: 'Egreso',
    adjustment_in: 'Ajuste (+)',
    adjustment_out: 'Ajuste (-)',
    initial_balance: 'Apertura'
  };
  return map[t] || t;
}

function deriveSessionMetrics(session, movs){
  const openingBs = Number(session?.start_balance_bs ?? 0);
  const openingUsd = Number(session?.start_balance_usd ?? 0);

  const sums = (movs||[]).reduce((acc,m)=>{
    if(m?.movement_type === 'initial_balance') return acc;
    const isIncome = (m?.movement_type === 'payment_in' || m?.movement_type === 'adjustment_in');
    const isExpense = (m?.movement_type === 'expense_out' || m?.movement_type === 'adjustment_out');
    const sign = isIncome ? 1 : isExpense ? -1 : 0;
    
    if(m?.currency === 'BS') acc.bs += sign * Number(m.amount || 0);
    if(m?.currency === 'USD') acc.usd += sign * Number(m.amount || 0);
    return acc;
  },{ bs:0, usd:0 });

  return { 
    openingBs, 
    openingUsd, 
    sumBs: sums.bs, 
    sumUsd: sums.usd, 
    balanceBs: openingBs + sums.bs, 
    balanceUsd: openingUsd + sums.usd 
  };
}
