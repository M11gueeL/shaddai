import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { adjustBatch } from '../../api/inventoryApi';
import { Trash2, Edit2, X, Minus, Plus, Clock } from 'lucide-react';
import { preventNegativeInput, preventNegativePaste } from '../../utils/formUtils';

export default function AdjustmentOverlay({ batch, type, onClose, onSuccess, token }) {
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
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all scale-100">
        <div className={`px-6 py-5 border-b flex justify-between items-center ${isDiscard ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'}`}>
          <h4 className={`font-bold text-lg flex items-center gap-2 ${isDiscard ? 'text-red-800' : 'text-indigo-800'}`}>
            {isDiscard ? <Trash2 size={22}/> : <Edit2 size={22}/>}
            {isDiscard ? 'Dar de Baja / Desechar' : 'Ajustar Stock'}
          </h4>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 text-gray-500 transition-colors"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
            <div>
                <span className="block text-xs text-gray-500 uppercase font-semibold">Lote</span>
                <span className="font-mono font-bold text-gray-900">{batch.batch_number || 'S/N'}</span>
            </div>
            <div className="text-right">
                <span className="block text-xs text-gray-500 uppercase font-semibold">Stock Actual</span>
                <span className="font-bold text-gray-900 text-lg">{batch.quantity}</span>
            </div>
          </div>

          {!isDiscard && (
            <div className="flex rounded-xl bg-gray-100 p-1.5">
              <button 
                type="button"
                onClick={() => setMode('subtract')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'subtract' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Minus size={18}/> Restar
              </button>
              <button 
                type="button"
                onClick={() => setMode('add')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'add' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Plus size={18}/> Sumar
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Cantidad a {isDiscard ? 'Desechar' : (mode === 'add' ? 'Agregar' : 'Quitar')}
            </label>
            <div className="relative">
                <input 
                type="number" 
                min="1" 
                max={mode === 'subtract' ? batch.quantity : undefined}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                onKeyDown={preventNegativeInput}
                onPaste={preventNegativePaste}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 text-xl font-bold text-center tracking-wide"
                placeholder="0"
                autoFocus
                />
            </div>
            
            {quantity && (
                <div className={`mt-2 text-center text-sm font-medium ${
                    (mode === 'subtract' && (batch.quantity - parseInt(quantity) < 0)) ? 'text-red-600' : 'text-gray-500'
                }`}>
                    Nuevo Stock Estimado: <span className="font-bold text-gray-900">
                        {mode === 'subtract' ? batch.quantity - parseInt(quantity) : batch.quantity + parseInt(quantity)}
                    </span>
                </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Motivo del Ajuste <span className="text-red-500">*</span>
            </label>
            <textarea 
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm px-4"
              rows="3"
              placeholder={isDiscard ? "Ej: Producto dañado, vencido..." : "Ej: Error de conteo, corrección de entrada..."}
            ></textarea>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
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
