import React, { useState, useEffect } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { getBrands } from '../../api/inventoryApi';
import { useAuth } from '../../context/AuthContext';

export default function ItemForm({ initial, onSubmit, loading }) {
  const { token } = useAuth();
  const [brands, setBrands] = useState([]);
  
  const [form, setForm] = useState(() => ({
    code: initial?.code || '',
    name: initial?.name || '',
    description: initial?.description || '',
    price_usd: initial?.price_usd || '',
    unit_of_measure: initial?.unit_of_measure || 'unidad',
    reorder_level: initial?.reorder_level || 5,
    brand_id: initial?.brand_id || '',
    is_active: initial?.is_active ?? 1
  }));

  useEffect(() => {
    if (token) {
        getBrands({ active: true }, token).then(res => setBrands(res.data || [])).catch(console.error);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      
      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6">
        <h3 className="text-sm font-bold text-indigo-900 mb-1">Información General</h3>
        <p className="text-xs text-indigo-600">Complete los detalles básicos del insumo médico.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del Insumo *</label>
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            placeholder="Ej. Paracetamol 500mg"
            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Código Interno</label>
          <input 
            name="code" 
            value={form.code} 
            onChange={handleChange} 
            placeholder="Ej. MED-001"
            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Marca / Laboratorio</label>
          <select 
            name="brand_id" 
            value={form.brand_id} 
            onChange={handleChange} 
            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4"
          >
            <option value="">Seleccionar marca...</option>
            {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio (USD) *</label>
          <div className="relative rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input 
              name="price_usd" 
              type="number" 
              step="0.01" 
              value={form.price_usd} 
              onChange={handleChange} 
              required 
              placeholder="0.00"
              className="block w-full rounded-xl border-gray-300 pl-7 focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Unidad de Medida</label>
          <input 
            name="unit_of_measure" 
            value={form.unit_of_measure} 
            onChange={handleChange} 
            placeholder="Ej. Caja, Unidad, Blister"
            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Punto de Reorden</label>
          <input 
            name="reorder_level" 
            type="number" 
            value={form.reorder_level} 
            onChange={handleChange} 
            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4" 
          />
          <p className="mt-1 text-xs text-gray-500">Alerta cuando el stock sea menor a este valor.</p>
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            rows={3} 
            placeholder="Detalles adicionales del insumo..."
            className="block w-full rounded-xl px-4 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all" 
          />
        </div>

        <div className="col-span-2">
            <div className="flex items-center p-4 border border-gray-200 rounded-xl bg-gray-50">
                <input 
                    id="is_active" 
                    type="checkbox" 
                    name="is_active" 
                    checked={form.is_active === 1} 
                    onChange={handleChange} 
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-gray-700">
                    Insumo Activo
                    <span className="block text-xs text-gray-500 font-normal">Si se desactiva, no aparecerá en las opciones de venta o uso.</span>
                </label>
            </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
        <button 
            type="submit" 
            disabled={loading} 
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />} 
          {initial ? 'Actualizar Insumo' : 'Guardar Insumo'}
        </button>
      </div>
    </form>
  );
}