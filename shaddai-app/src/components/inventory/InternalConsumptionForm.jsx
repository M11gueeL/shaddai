import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { preventNegativeInput, preventNegativePaste } from '../../utils/formUtils';

export default function InternalConsumptionForm({ item, onSubmit, loading }) {
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      item_id: item.id,
      quantity, 
      notes 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 mb-6">
        <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-bold text-amber-900">Registro de Uso Interno</h3>
        </div>
        <p className="text-xs text-amber-700">
            Registrando salida para: <span className="font-bold">{item.name}</span> (Stock Actual: {item.stock_quantity})
        </p>
        <p className="text-xs text-amber-600 mt-1">
            Este movimiento se registrará como gasto operativo del consultorio.
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad a Retirar *</label>
        <input 
          type="number" 
          min="1"
          max={item.stock_quantity}
          required 
          value={quantity} 
          onKeyDown={preventNegativeInput} 
          onPaste={preventNegativePaste} 
          onChange={(e) => setQuantity(parseInt(e.target.value || '0'))} 
          className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 text-sm transition-all px-4" 
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Máximo disponible: {item.stock_quantity}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo *</label>
        <input 
            type="text" 
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 text-sm transition-all px-4"
            placeholder="Ej: Uso en consulta, donación, etc."
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading || quantity <= 0 || quantity > item.stock_quantity || !notes.trim()}
          className="bg-amber-600 text-white px-6 py-2.5 rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? 'Registrando...' : 'Registrar Consumo'}
        </button>
      </div>
    </form>
  );
}
