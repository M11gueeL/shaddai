import React, { useState } from 'react';
import { Loader2, Store, Save } from 'lucide-react';
import { createSupplier } from '../../api/inventoryApi';

const initialForm = {
  name: '',
  doc_type: 'J',
  doc_number: '',
  contact_name: '',
  phone: '',
  email: '',
  address: ''
};

const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

export default function NewSupplierModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const onFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetAndClose = () => {
    setForm(initialForm);
    setError('');
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('El nombre del proveedor es obligatorio.');
      return;
    }

    const compiledTaxId = form.doc_number.trim() ? `${form.doc_type}-${form.doc_number.trim()}` : '';

    if (compiledTaxId && !/^[VJEG]-[0-9]+(-[0-9])?$/.test(compiledTaxId)) {
      setError('El Documento/RIF tiene un formato inválido.');
      return;
    }

    if (form.phone.trim() && !phoneRegex.test(form.phone.trim())) {
      setError('El teléfono tiene un formato inválido.');
      return;
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('El correo tiene un formato inválido.');
      return;
    }

    try {
      setLoading(true);
      const res = await createSupplier({
        name: form.name.trim(),
        tax_id: compiledTaxId || null,
        contact_name: form.contact_name.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null
      });

      const payload = res?.data || {};
      const newSupplier = {
        id: payload.supplier_id || payload.id || null,
        name: form.name.trim(),
        tax_id: compiledTaxId || null,
        contact_name: form.contact_name.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        is_active: 1
      };

      onSuccess?.(newSupplier);
      resetAndClose();
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'No se pudo registrar el proveedor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={(e) => { e.stopPropagation(); resetAndClose(); }} />
      
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white px-6 py-5 border-b border-gray-100 flex items-start z-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Store size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Registrar Proveedor</h2>
            </div>
            <p className="text-sm text-gray-500 ml-11">
              Nuevo proveedor para abastecimiento e inventario.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          <form id="new-supplier-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nombre o Razón Social <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onFieldChange('name', e.target.value)}
                required
                className="block w-full rounded-xl border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all shadow-sm"
                placeholder="Ej. Droguería Central C.A."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Documento / RIF</label>
                <div className="flex items-center rounded-xl shadow-sm border border-gray-300 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 overflow-hidden transition-all">
                  <select
                    value={form.doc_type}
                    onChange={(e) => onFieldChange('doc_type', e.target.value)}
                    className="h-full py-3 px-3 border-none bg-transparent text-gray-700 font-medium text-sm focus:ring-0 cursor-pointer"
                  >
                    <option value="J">J</option>
                    <option value="V">V</option>
                    <option value="E">E</option>
                    <option value="G">G</option>
                    <option value="P">P</option>
                  </select>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <input
                    type="text"
                    value={form.doc_number}
                    onChange={(e) => onFieldChange('doc_number', e.target.value.replace(/[^0-9-]/g, ''))}
                    className="w-full border-none px-3 py-3 text-sm focus:ring-0 bg-transparent"
                    placeholder="123456789-0"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Persona de Contacto</label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => onFieldChange('contact_name', e.target.value)}
                  className="block w-full rounded-xl border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all shadow-sm"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Teléfono</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => onFieldChange('phone', e.target.value)}
                  className="block w-full rounded-xl border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all shadow-sm"
                  placeholder="Ej. 0414-1234567"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Correo Electrónico</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onFieldChange('email', e.target.value)}
                  className="block w-full rounded-xl border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all shadow-sm"
                  placeholder="contacto@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Dirección</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => onFieldChange('address', e.target.value)}
                className="block w-full rounded-xl border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all shadow-sm resize-none"
                placeholder="Dirección fiscal o física..."
              />
            </div>
            
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="new-supplier-form"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Guardar Proveedor
            </button>
        </div>
      </div>
    </div>
  );
}
