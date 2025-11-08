import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ItemForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(() => ({
    code: initial?.code || '',
    name: initial?.name || '',
    description: initial?.description || '',
    price_usd: initial?.price_usd || '',
    unit_of_measure: initial?.unit_of_measure || 'unidad',
    reorder_level: initial?.reorder_level || 5,
    stock_quantity: initial?.stock_quantity || 0,
    is_active: initial?.is_active ?? 1
  }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600">Nombre *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">Código</label>
          <input name="code" value={form.code} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">Precio USD *</label>
          <input name="price_usd" type="number" step="0.01" value={form.price_usd} onChange={handleChange} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">Unidad</label>
          <input name="unit_of_measure" value={form.unit_of_measure} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">Nivel Reorden</label>
          <input name="reorder_level" type="number" value={form.reorder_level} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">Stock Inicial</label>
          <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-gray-600">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-2">
          <input id="is_active" type="checkbox" name="is_active" checked={form.is_active === 1} onChange={handleChange} className="rounded" />
          <label htmlFor="is_active" className="text-xs font-semibold text-gray-600">Activo</label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
        </button>
      </div>
    </form>
  );
}
