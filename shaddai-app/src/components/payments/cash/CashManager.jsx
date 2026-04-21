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
  AlertTriangle,
  CheckCircle2,
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

  // Close Session Modal State
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closeFormData, setCloseFormData] = useState({
    declared_usd: '',
    declared_bs: '',
    notes: ''
  });
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementFormData, setMovementFormData] = useState({
    movement_type: 'expense_out',
    amount: '',
    currency: 'USD',
    description: ''
  });

  // lock background scroll when modal is open
  useEffect(()=>{
    if(openModal || isCloseModalOpen || isMovementModalOpen){
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  },[openModal, isCloseModalOpen, isMovementModalOpen]);

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

  const expectedBalances = useMemo(() => {
    let expectedUsd = parseFloat(session?.start_balance_usd) || 0;
    let expectedBs = parseFloat(session?.start_balance_bs) || 0;

    const inTypes = ['payment_in', 'adjustment_in'];
    const outTypes = ['expense_out', 'adjustment_out', 'reversal'];

    (movs || []).forEach((mov) => {
      if (mov?.is_virtual) return;

      const type = mov?.movement_type;
      const currency = mov?.currency;
      const amount = parseFloat(mov?.amount) || 0;

      if (amount <= 0) return;

      if (inTypes.includes(type)) {
        if (currency === 'USD') expectedUsd += amount;
        if (currency === 'BS') expectedBs += amount;
      }

      if (outTypes.includes(type)) {
        if (currency === 'USD') expectedUsd -= amount;
        if (currency === 'BS') expectedBs -= amount;
      }
    });

    return {
      usd: Number(expectedUsd.toFixed(2)),
      bs: Number(expectedBs.toFixed(2))
    };
  }, [session, movs]);

  const declaredUsd = closeFormData.declared_usd === '' ? 0 : (parseFloat(closeFormData.declared_usd) || 0);
  const declaredBs = closeFormData.declared_bs === '' ? 0 : (parseFloat(closeFormData.declared_bs) || 0);

  const diffUsd = Number((declaredUsd - expectedBalances.usd).toFixed(2));
  const diffBs = Number((declaredBs - expectedBalances.bs).toFixed(2));

  const hasUsdDifference = Math.abs(diffUsd) >= 0.01;
  const hasBsDifference = Math.abs(diffBs) >= 0.01;
  const hasAnyDifference = hasUsdDifference || hasBsDifference;
  const hasAnyShortage = diffUsd < -0.009 || diffBs < -0.009;
  const hasAnySurplus = diffUsd > 0.009 || diffBs > 0.009;

  const requiresCloseNotes = hasAnyDifference;
  const hasValidCloseNotes = closeFormData.notes.trim().length >= 5;

  const closeStatusConfig = !hasAnyDifference
    ? {
        title: 'Caja cuadrada',
        message: 'El efectivo declarado coincide con el efectivo esperado por el sistema.',
        boxClass: 'bg-emerald-50 border-emerald-200',
        titleClass: 'text-emerald-700',
        textClass: 'text-emerald-700'
      }
    : hasAnyShortage
      ? {
          title: 'Faltante detectado',
          message: 'Hay menos efectivo que el esperado. Debes registrar una explicación antes de cerrar.',
          boxClass: 'bg-red-50 border-red-200',
          titleClass: 'text-red-700',
          textClass: 'text-red-700'
        }
      : {
          title: 'Sobrante detectado',
          message: 'Hay más efectivo que el esperado. Registra una explicación para dejar trazabilidad.',
          boxClass: 'bg-amber-50 border-amber-200',
          titleClass: 'text-amber-700',
          textClass: 'text-amber-700'
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

  const handleCloseSessionClick = () => {
    // Reset form data and open the modal
    setCloseFormData({
      declared_usd: expectedBalances.usd.toFixed(2),
      declared_bs: expectedBalances.bs.toFixed(2),
      notes: ''
    });
    setIsCloseModalOpen(true);
  };

  const submitCloseSession = async (e) => {
    e?.preventDefault?.();

    if (requiresCloseNotes && !hasValidCloseNotes) {
      toast.error('Debes explicar la diferencia en observaciones antes de cerrar caja');
      return;
    }

    const differences = [];
    if (hasUsdDifference) differences.push(`USD ${diffUsd > 0 ? '+' : ''}${diffUsd.toFixed(2)}`);
    if (hasBsDifference) differences.push(`BS ${diffBs > 0 ? '+' : ''}${diffBs.toFixed(2)}`);

    const ok = await confirm({ 
      title: 'Confirmar Cierre de Caja', 
      message: hasAnyDifference
        ? `Se detectaron diferencias (${differences.join(' | ')}). ¿Desea cerrar la sesión con estas diferencias?`
        : 'No hay diferencias entre lo esperado y lo declarado. ¿Desea cerrar la sesión?', 
      tone: hasAnyDifference ? (hasAnyShortage ? 'danger' : 'warning') : 'info', 
      confirmText: hasAnyDifference ? 'Cerrar con Diferencia' : 'Cerrar Sesión', 
      cancelText: 'Cancelar' 
    });
    if(!ok) return;

    try {
      const payload = {
        declared_usd: parseFloat(closeFormData.declared_usd) || 0,
        declared_bs: parseFloat(closeFormData.declared_bs) || 0,
        notes: closeFormData.notes
      };
      
      const res = await cashApi.closeSession(payload);
      toast.success(res?.data?.message || 'Sesión cerrada correctamente');
      setIsCloseModalOpen(false);
      load();
    } catch(e) { 
      toast.error(e?.response?.data?.error || 'Error al cerrar caja'); 
    }
  };

  const handleOpenMovementModal = () => {
    setMovementFormData({
      movement_type: 'expense_out',
      amount: '',
      currency: 'USD',
      description: ''
    });
    setIsMovementModalOpen(true);
  };

  const submitMovement = async (e) => {
    e?.preventDefault?.();

    const amount = parseFloat(movementFormData.amount);
    const description = movementFormData.description.trim();

    if (isNaN(amount) || amount <= 0) {
      toast.error('Ingresa un monto mayor a 0');
      return;
    }

    if (!description) {
      toast.error('La descripción es obligatoria');
      return;
    }

    try {
      await cashApi.addMovement({
        movement_type: movementFormData.movement_type,
        amount,
        currency: movementFormData.currency,
        description
      });

      toast.success('Movimiento registrado correctamente');
      setIsMovementModalOpen(false);
      setMovementFormData({
        movement_type: 'expense_out',
        amount: '',
        currency: 'USD',
        description: ''
      });
      load();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Error al registrar movimiento');
    }
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
           {status === 'open' && (
             <button
               onClick={handleOpenMovementModal}
               className="px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm"
               title="Registrar egreso o ajuste"
             >
               <CircleDollarSign className="w-4 h-4" />
               Registrar Movimiento
             </button>
           )}
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
             closeSession={handleCloseSessionClick}
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

      {/* Modal de Cierre de Sesión / Arqueo de Caja */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-gray-900/20 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-500" />
                Arqueo de Caja
              </h3>
              <button onClick={() => setIsCloseModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              Verifica el efectivo esperado y declara el monto contado físicamente antes del cierre.
            </p>

            <form onSubmit={submitCloseSession} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Esperado USD</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">${expectedBalances.usd.toFixed(2)}</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Esperado BS</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">Bs {expectedBalances.bs.toFixed(2)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Efectivo Contado Bs</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={closeFormData.declared_bs} 
                    onChange={(e) => setCloseFormData(prev => ({ ...prev, declared_bs: e.target.value }))} 
                    className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 px-4 py-3 outline-none transition-all" 
                    placeholder="0.00" 
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Efectivo Contado USD</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={closeFormData.declared_usd} 
                    onChange={(e) => setCloseFormData(prev => ({ ...prev, declared_usd: e.target.value }))} 
                    className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 px-4 py-3 outline-none transition-all" 
                    placeholder="0.00" 
                    required
                  />
                </div>
              </div>

              <div className={`rounded-2xl border p-4 ${closeStatusConfig.boxClass}`}>
                <div className="flex items-start gap-3">
                  {!hasAnyDifference ? (
                    <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 mt-0.5 text-current" />
                  )}
                  <div className="flex-1">
                    <div className={`font-semibold ${closeStatusConfig.titleClass}`}>{closeStatusConfig.title}</div>
                    <p className={`text-sm mt-1 ${closeStatusConfig.textClass}`}>{closeStatusConfig.message}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    !hasUsdDifference
                      ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                      : diffUsd < 0
                        ? 'bg-red-100 border-red-200 text-red-700'
                        : 'bg-amber-100 border-amber-200 text-amber-700'
                  }`}>
                    Diferencia USD: {diffUsd > 0 ? '+' : ''}{diffUsd.toFixed(2)}
                  </div>
                  <div className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    !hasBsDifference
                      ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                      : diffBs < 0
                        ? 'bg-red-100 border-red-200 text-red-700'
                        : 'bg-amber-100 border-amber-200 text-amber-700'
                  }`}>
                    Diferencia BS: {diffBs > 0 ? '+' : ''}{diffBs.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Observaciones {requiresCloseNotes ? '(obligatorio por diferencia)' : '(opcional)'}
                </label>
                <textarea 
                  rows={3} 
                  value={closeFormData.notes} 
                  onChange={(e) => setCloseFormData(prev => ({ ...prev, notes: e.target.value }))} 
                  className={`w-full rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 px-4 py-3 outline-none transition-all resize-none ${
                    requiresCloseNotes && !hasValidCloseNotes ? 'border-red-300' : 'border-gray-200'
                  }`} 
                  placeholder="Ej: Faltan 10 USD por error al dar vuelto" 
                  required={requiresCloseNotes}
                />
                {requiresCloseNotes && !hasValidCloseNotes && (
                  <p className="text-xs text-red-600">Debes escribir una explicación (mínimo 5 caracteres).</p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCloseModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={requiresCloseNotes && !hasValidCloseNotes}
                  className={`flex-1 py-3 text-white font-medium rounded-xl shadow-lg transition-all ${
                    requiresCloseNotes && !hasValidCloseNotes
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 hover:bg-gray-800 hover:shadow-xl'
                  }`}
                >
                  Cerrar Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Movimiento Manual */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-gray-900/20 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-indigo-500" />
                Registrar Movimiento de Caja
              </h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={submitMovement} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Tipo de Movimiento</label>
                  <select
                    value={movementFormData.movement_type}
                    onChange={(e) => setMovementFormData((prev) => ({ ...prev, movement_type: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 px-4 py-3 outline-none transition-all"
                  >
                    <option value="expense_out">Gasto/Salida</option>
                    <option value="adjustment_in">Ajuste de Entrada</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Moneda</label>
                  <select
                    value={movementFormData.currency}
                    onChange={(e) => setMovementFormData((prev) => ({ ...prev, currency: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 px-4 py-3 outline-none transition-all"
                  >
                    <option value="USD">USD</option>
                    <option value="BS">BS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={movementFormData.amount}
                  onChange={(e) => setMovementFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 px-4 py-3 outline-none transition-all"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Concepto / Descripción</label>
                <textarea
                  rows={3}
                  value={movementFormData.description}
                  onChange={(e) => setMovementFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 px-4 py-3 outline-none transition-all resize-none"
                  placeholder="Ej: Compra de agua para recepción"
                  required
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
