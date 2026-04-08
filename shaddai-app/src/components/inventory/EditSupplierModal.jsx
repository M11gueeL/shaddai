import React, { useEffect, useState } from 'react';
import { Loader2, PencilLine, Save } from 'lucide-react';
import Modal from './Modal';

const rifRegex = /^[A-Za-z0-9-]{5,20}$/;
const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

const initialForm = {
  name: '',
  tax_id: '',
  contact_name: '',
  phone: '',
  email: '',
  address: '',
  is_active: 1
};

export default function EditSupplierModal({ open, onClose, supplier, loading = false, onSave }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !supplier) return;
    setForm({
      name: supplier.name || '',
      tax_id: supplier.tax_id || '',
      contact_name: supplier.contact_name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      is_active: Number(supplier.is_active) === 0 ? 0 : 1
    });
    setError('');
  }, [open, supplier]);

  const onFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('El nombre del proveedor es obligatorio.');
      return;
    }

    if (form.tax_id.trim() && !rifRegex.test(form.tax_id.trim())) {
      setError('El RIF/Cédula tiene un formato inválido.');
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

    await onSave?.({
      name: form.name.trim(),
      tax_id: form.tax_id.trim() || null,
      contact_name: form.contact_name.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      is_active: Number(form.is_active) === 0 ? 0 : 1
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar proveedor" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-900">
            <PencilLine className="h-4 w-4" />
            Actualización de datos del proveedor
          </div>
          <p className="text-xs text-amber-700">Edita solo la información necesaria para mantener el directorio limpio.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            required
            className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm shadow-sm"
            placeholder="Nombre del proveedor"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">RIF/Cédula</label>
            <input
              type="text"
              value={form.tax_id}
              onChange={(e) => onFieldChange('tax_id', e.target.value)}
              className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm shadow-sm"
              placeholder="J-12345678-9"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Contacto</label>
            <input
              type="text"
              value={form.contact_name}
              onChange={(e) => onFieldChange('contact_name', e.target.value)}
              className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm shadow-sm"
              placeholder="Persona de contacto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm shadow-sm"
              placeholder="0412-0000000"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Correo</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm shadow-sm"
              placeholder="correo@dominio.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Dirección</label>
          <textarea
            rows={2}
            value={form.address}
            onChange={(e) => onFieldChange('address', e.target.value)}
            className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm shadow-sm"
            placeholder="Dirección comercial"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Number(form.is_active) === 1}
              onChange={(e) => onFieldChange('is_active', e.target.checked ? 1 : 0)}
            />
            Proveedor activo
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
