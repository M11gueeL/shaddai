import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function RestockForm({ item, onSubmit, loading }) {
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ quantity, notes }); }} className="space-y-5">
      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-800">
        Stock actual: <strong>{item.stock_quantity}</strong>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">Cantidad a agregar *</label>
        <input type="number" min={1} required value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value || '0'))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">Notas</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-end">
        <button type="submit" disabled={loading} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} Abastecer
        </button>
      </div>
    </form>
  );
}
