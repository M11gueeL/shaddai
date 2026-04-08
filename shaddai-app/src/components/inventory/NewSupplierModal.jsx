import React, { useState } from 'react';
import { Loader2, Save, Store } from 'lucide-react';
import Modal from './Modal';
import { createSupplier } from '../../api/inventoryApi';

const initialForm = {
  name: '',
  tax_id: '',
  phone: '',
  email: '',
  address: ''
};

const rifRegex = /^[A-Za-z0-9-]{5,20}$/;
const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

export default function NewSupplierModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    try {
      setLoading(true);
      const res = await createSupplier({
        name: form.name.trim(),
        tax_id: form.tax_id.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null
      });

      const payload = res?.data || {};
      const newSupplier = {
        id: payload.supplier_id || payload.id || null,
        name: form.name.trim(),
        tax_id: form.tax_id.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null
      };

      onSuccess?.(newSupplier);
      resetAndClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo registrar el proveedor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={resetAndClose} title="Registrar Proveedor" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <Store className="h-4 w-4" />
            Nuevo proveedor para abastecimiento
          </div>
          <p className="text-xs text-indigo-700">Completa los datos y se agregara al selector de compras.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            required
            className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Ej. Farmacia Central"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">RIF/Cedula</label>
            <input
              type="text"
              value={form.tax_id}
              onChange={(e) => onFieldChange('tax_id', e.target.value)}
              pattern="[A-Za-z0-9-]{5,20}"
              className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="J-12345678-9"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefono</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              pattern="[0-9+()\-\s]{7,20}"
              className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="0412-0000000"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Correo</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="proveedor@correo.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Direccion</label>
          <textarea
            rows={2}
            value={form.address}
            onChange={(e) => onFieldChange('address', e.target.value)}
            className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Direccion comercial"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Cargando...' : 'Guardar proveedor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
