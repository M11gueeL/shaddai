import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, CheckCircle, Clock, Package, Archive, Edit2, Plus, Minus, PauseCircle, PlayCircle } from 'lucide-react';
import { getBatches, adjustBatch, toggleBatchStatus } from '../../api/inventoryApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export default function BatchManagementModal({ item, onClose, onUpdate }) {
  const { token } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustingBatch, setAdjustingBatch] = useState(null); // { batch, type: 'correction' | 'discard' }

  useEffect(() => {
    if (item && token) {
        fetchBatches();
    }
  }, [item, token]);

  const fetchBatches = async () => {
    try {
      const res = await getBatches(item.id, token); 
      setBatches(res.data || []);
    } catch (error) {
      toast.error("Error cargando lotes");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustmentSuccess = () => {
    setAdjustingBatch(null);
    fetchBatches();
    onUpdate();
  };

  const handleToggleStatus = async (batch) => {
    const newStatus = batch.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'activar' : 'suspender';
    
    const isConfirmed = await confirm({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} lote?`,
      message: `¿Estás seguro de ${action} este lote? ${newStatus === 'suspended' ? 'No se podrá usar para salidas.' : 'Volverá a estar disponible.'}`,
      confirmText: 'Sí, confirmar',
      cancelText: 'Cancelar',
      tone: newStatus === 'suspended' ? 'warning' : 'info'
    });

    if (!isConfirmed) return;

    try {
      await toggleBatchStatus({ batch_id: batch.id, status: newStatus }, token);
      toast.success(`Lote ${newStatus === 'active' ? 'activado' : 'suspendido'}`);
      fetchBatches();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error cambiando estado");
    }
  };

  const getStatusColor = (batch) => {
    // Prioridad 0: Suspendido
    if (batch.status === 'suspended') return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-500', label: 'SUSPENDIDO', icon: <PauseCircle size={14}/> };

    // Prioridad 1: ¿Está vacío?
    if (batch.quantity === 0) return { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-500', label: 'AGOTADO/CERRADO', icon: <Archive size={14}/> };
    
    // Prioridad 2: Fechas
    const days = Math.ceil((new Date(batch.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'VENCIDO', icon: <AlertTriangle size={14}/> };
    if (days < 30) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'POR VENCER', icon: <Clock size={14}/> };
    return { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-700', label: 'ACTIVO', icon: <CheckCircle size={14}/> };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-indigo-600" /> Gestión de Lotes
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Producto: <span className="font-medium text-gray-900">{item.name}</span> | Stock Total: {item.stock_quantity}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {loading ? (
            <div className="flex justify-center py-10"><Clock className="animate-spin text-indigo-600"/></div>
          ) : batches.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
              <Package size={48} className="mx-auto text-gray-300 mb-3"/>
              <p className="text-gray-500 font-medium">No hay historial de lotes para este producto.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map(batch => {
                const style = getStatusColor(batch);
                // Calcular progreso: (Actual / Inicial) * 100
                const initial = batch.initial_quantity || batch.quantity; // Fallback
                const percentage = Math.round((batch.quantity / initial) * 100);
                const isSuspended = batch.status === 'suspended';
                
                return (
                  <div key={batch.id} className={`group relative overflow-hidden rounded-xl border ${style.border} ${style.bg} transition-all hover:shadow-md ${isSuspended ? 'opacity-75' : ''}`}>
                    
                    <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between relative z-10">
                      
                      {/* Info Principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg text-gray-800">
                            {batch.batch_number || 'Sin Número'}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 border bg-white/80 ${style.text}`}>
                            {style.icon} {style.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 flex gap-4">
                          <span>Vence: <strong>{batch.expiration_date}</strong></span>
                          <span className="text-gray-400">|</span>
                          <span>Entrada: <strong>{batch.created_at?.substring(0,10)}</strong></span>
                        </div>
                      </div>

                      {/* Barra de Estadísticas Visual */}
                      <div className="flex-1 w-full sm:max-w-xs">
                        <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-600">
                          <span>Disponible: {batch.quantity}</span>
                          <span>Inicial: {initial}</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${batch.quantity === 0 ? 'bg-gray-400' : (isSuspended ? 'bg-gray-400' : 'bg-indigo-500')}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-right text-[10px] text-gray-400 mt-1">
                          {percentage}% Remanente
                        </div>
                      </div>

                      {/* Acciones */}
                      {batch.quantity > 0 && (
                        <div className="flex flex-col gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-200/50 sm:pl-4 mt-2 sm:mt-0 min-w-[140px]">
                          <button 
                            onClick={() => handleToggleStatus(batch)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-lg transition w-full justify-center ${isSuspended ? 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100'}`}
                            title={isSuspended ? "Reactivar lote para uso" : "Suspender lote (no se usará en salidas)"}
                          >
                            {isSuspended ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                            <span>{isSuspended ? 'Reactivar' : 'Suspender'}</span>
                          </button>

                          <button 
                            onClick={() => setAdjustingBatch({ batch, type: 'correction' })}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition w-full justify-center"
                          >
                            <Edit2 size={14} /> 
                            <span>Ajustar Stock</span>
                          </button>
                          <button 
                            onClick={() => setAdjustingBatch({ batch, type: 'discard' })}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition w-full justify-center"
                          >
                            <Trash2 size={14} /> 
                            <span>Dar de Baja</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Ajuste Interno */}
        {adjustingBatch && (
          <AdjustmentOverlay 
            batch={adjustingBatch.batch} 
            type={adjustingBatch.type}
            onClose={() => setAdjustingBatch(null)}
            onSuccess={handleAdjustmentSuccess}
            token={token}
          />
        )}
      </div>
    </div>
  );
}

function AdjustmentOverlay({ batch, type, onClose, onSuccess, token }) {
  const toast = useToast();
  const [mode, setMode] = useState('subtract'); // 'add' or 'subtract'
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Si es 'discard', forzamos modo 'subtract' y no permitimos cambiar
  const isDiscard = type === 'discard';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const qtyNum = parseInt(quantity);
    
    if (!qtyNum || qtyNum <= 0) {
      toast.error("Ingresa una cantidad válida mayor a 0");
      return;
    }
    if ((mode === 'subtract' || isDiscard) && qtyNum > batch.quantity) {
      toast.error(`No puedes restar más de lo que hay (${batch.quantity})`);
      return;
    }
    if (!reason.trim()) {
      toast.error("Debes especificar un motivo para el ajuste");
      return;
    }

    // Calcular delta (positivo o negativo)
    const delta = (mode === 'add' && !isDiscard) ? qtyNum : -qtyNum;

    setLoading(true);
    try {
      await adjustBatch({
        batch_id: batch.id,
        quantity: delta,
        reason: reason,
        type: type // 'correction' or 'discard'
      }, token);
      
      toast.success(isDiscard ? "Baja registrada correctamente" : "Inventario ajustado correctamente");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al ajustar lote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDiscard ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'}`}>
          <h4 className={`font-bold flex items-center gap-2 ${isDiscard ? 'text-red-800' : 'text-indigo-800'}`}>
            {isDiscard ? <Trash2 size={20}/> : <Edit2 size={20}/>}
            {isDiscard ? 'Dar de Baja / Desechar' : 'Ajustar / Corregir Stock'}
          </h4>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 text-gray-500"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
            Lote: <strong>{batch.batch_number || 'S/N'}</strong> <br/>
            Stock Actual: <strong>{batch.quantity}</strong>
          </div>

          {!isDiscard && (
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button 
                type="button"
                onClick={() => setMode('subtract')}
                className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'subtract' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Minus size={16}/> Restar (Salida)
              </button>
              <button 
                type="button"
                onClick={() => setMode('add')}
                className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'add' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Plus size={16}/> Sumar (Entrada)
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Cantidad a {isDiscard ? 'Desechar' : (mode === 'add' ? 'Agregar' : 'Quitar')}
            </label>
            <input 
              type="number" 
              min="1" 
              max={mode === 'subtract' ? batch.quantity : undefined}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2.5 text-lg font-semibold text-center"
              placeholder="0"
              autoFocus
            />
            {quantity && mode === 'subtract' && (
              <p className="text-xs text-gray-500 mt-1 text-right">
                Nuevo Stock: {batch.quantity - parseInt(quantity)}
              </p>
            )}
            {quantity && mode === 'add' && (
              <p className="text-xs text-gray-500 mt-1 text-right">
                Nuevo Stock: {batch.quantity + parseInt(quantity)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Motivo del Ajuste (Requerido)
            </label>
            <textarea 
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              rows="3"
              placeholder={isDiscard ? "Ej: Producto dañado, vencido..." : "Ej: Error de conteo, corrección de entrada..."}
            ></textarea>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2
                ${isDiscard ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : (mode === 'add' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200')}
              `}
            >
              {loading ? <Clock className="animate-spin"/> : (isDiscard ? 'Confirmar Baja' : 'Confirmar Ajuste')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}