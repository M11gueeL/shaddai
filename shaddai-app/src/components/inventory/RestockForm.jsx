import React, { useState } from 'react';
import { Loader2, PackagePlus } from 'lucide-react';

export default function RestockForm({ item, onSubmit, loading }) {
  const [quantity, setQuantity] = useState(0);
  const [expirationDate, setExpirationDate] = useState(''); // Nuevo
  const [batchNumber, setBatchNumber] = useState('');       // Nuevo
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Enviamos los datos del lote
    onSubmit({ 
      quantity, 
      expiration_date: expirationDate,
      batch_number: batchNumber,
      notes 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6">
        <h3 className="text-sm font-bold text-indigo-900 mb-1">Abastecimiento de Inventario</h3>
        <p className="text-xs text-indigo-600">
            Registrando entrada para: <span className="font-bold">{item.name}</span> (Stock Actual: {item.stock_quantity})
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad a Ingresar *</label>
          <input 
            type="number" 
            min={1} 
            required 
            value={quantity} 
            onChange={(e) => setQuantity(parseInt(e.target.value || '0'))} 
            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4" 
            placeholder="0"
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha Vencimiento *</label>
            <input 
                type="date" 
                required 
                value={expirationDate} 
                onChange={(e) => setExpirationDate(e.target.value)} 
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4" 
            />
        </div>

        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Número de Lote (Opcional)</label>
            <input 
                type="text" 
                value={batchNumber} 
                onChange={(e) => setBatchNumber(e.target.value)} 
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4" 
                placeholder="Ej. L-2026-A"
            />
        </div>

        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas / Observaciones</label>
            <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                rows={3} 
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4" 
                placeholder="Detalles adicionales sobre este ingreso..."
            />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
        <button 
            type="submit" 
            disabled={loading} 
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackagePlus size={18} />} 
          Registrar Entrada
        </button>
      </div>
    </form>
  );
}