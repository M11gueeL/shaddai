import React, { useEffect, useMemo, useState } from 'react';
import * as cashApi from '../../../api/cashregister';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { 
  Wallet, 
  RefreshCw, 
  History,
  CircleDollarSign,
  X
} from 'lucide-react';

import SessionCard from './SessionCard';
import SummaryCards from './SummaryCards';
import MovementItem from './MovementItem';

export default function CashManager(){
  const { token, user } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('closed');
  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false); // Can be used for separate modal if needed, but using inline now
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
           <SessionCard 
             status={status}
             session={session}
             loading={loading}
             user={user}
             openingUsd={openingUsd}
             setOpeningUsd={setOpeningUsd}
             openingBs={openingBs}
             setOpeningBs={setOpeningBs}
             submitOpen={submitOpen}
             closeSession={closeSession}
           />
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

            <div className="overflow-y-auto flex-1 p-4 scroll-smooth custom-scrollbar">
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
      
      {/* Modal if maintained */}
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
