import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, PackagePlus, Plus, ReceiptText, Save, Trash2, Truck, UserPlus } from 'lucide-react';
import Modal from './Modal';
import { preventNegativeInput, preventNegativePaste } from '../../utils/formUtils';
import { useToast } from '../../context/ToastContext';

const emptyLine = {
  item_id: '',
  quantity: 1,
  unit_cost: '',
  batch_number: '',
  expiration_date: ''
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const skuLoteRegex = /^[A-Za-z0-9._/-]{2,50}$/;
const rifRegex = /^[A-Za-z0-9-]{5,20}$/;
const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

export default function PurchaseRestockModal({
  open,
  onClose,
  products = [],
  suppliers = [],
  onSubmit,
  onCreateSupplier,
  submitting = false,
  creatingSupplier = false
}) {
  const toast = useToast();
  const [purchaseHeader, setPurchaseHeader] = useState({
    supplier_id: '',
    invoice_number: '',
    purchase_date: todayIso(),
    currency: 'USD',
    notes: ''
  });
  const [lines, setLines] = useState([{ ...emptyLine }]);

  const [showQuickSupplier, setShowQuickSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    tax_id: '',
    contact_name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    if (!open) return;
    setPurchaseHeader({
      supplier_id: '',
      invoice_number: '',
      purchase_date: todayIso(),
      currency: 'USD',
      notes: ''
    });
    setLines([{ ...emptyLine }]);
    setShowQuickSupplier(false);
    setNewSupplier({
      name: '',
      tax_id: '',
      contact_name: '',
      phone: '',
      email: '',
      address: ''
    });
  }, [open]);

  const notifyValidationErrors = (list) => {
    if (!list.length) return;
    toast.error(list[0]);
    if (list.length > 1) {
      toast.info(`Hay ${list.length - 1} validacion(es) adicional(es) por corregir.`);
    }
  };

  const linesWithTotals = useMemo(() => {
    return lines.map((line) => {
      const qty = Number(line.quantity || 0);
      const cost = Number(line.unit_cost || 0);
      return {
        ...line,
        subtotal: qty * cost
      };
    });
  }, [lines]);

  const grandTotal = useMemo(() => {
    return linesWithTotals.reduce((sum, line) => sum + line.subtotal, 0);
  }, [linesWithTotals]);

  const setHeaderValue = (field, value) => {
    setPurchaseHeader((prev) => ({ ...prev, [field]: value }));
  };

  const setLineValue = (index, field, value) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value
      };
      return next;
    });
  };

  const addLine = () => {
    setLines((prev) => [...prev, { ...emptyLine }]);
  };

  const removeLine = (index) => {
    setLines((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const getValidationErrors = () => {
    const list = [];
    const seenLineKeys = new Set();

    if (!purchaseHeader.supplier_id) {
      list.push('Debes seleccionar un proveedor.');
    }

    if (!purchaseHeader.purchase_date) {
      list.push('Debes indicar la fecha de compra.');
    } else if (purchaseHeader.purchase_date > todayIso()) {
      list.push('La fecha de compra no puede estar en el futuro.');
    }

    if (purchaseHeader.invoice_number && !/^[A-Za-z0-9._/-]{3,100}$/.test(purchaseHeader.invoice_number.trim())) {
      list.push('El número de factura contiene caracteres no permitidos.');
    }

    lines.forEach((line, idx) => {
      const n = idx + 1;
      if (!line.item_id) list.push(`Línea ${n}: selecciona un producto.`);
      if (!line.quantity || Number(line.quantity) <= 0) list.push(`Línea ${n}: la cantidad debe ser mayor a 0.`);
      if (line.unit_cost === '' || Number(line.unit_cost) < 0) list.push(`Línea ${n}: el costo unitario es inválido.`);
      if (!line.batch_number || !line.batch_number.trim()) list.push(`Línea ${n}: el número de lote es obligatorio.`);
      if (!line.expiration_date) list.push(`Línea ${n}: la fecha de vencimiento es obligatoria.`);

      if (line.batch_number && !skuLoteRegex.test(line.batch_number.trim())) {
        list.push(`Línea ${n}: el número de lote solo permite letras, números, ., -, _, /.`);
      }

      if (line.expiration_date && purchaseHeader.purchase_date && line.expiration_date < purchaseHeader.purchase_date) {
        list.push(`Línea ${n}: el vencimiento no puede ser menor a la fecha de compra.`);
      }

      const key = `${line.item_id || 'x'}::${(line.batch_number || '').trim().toUpperCase()}`;
      if (line.item_id && (line.batch_number || '').trim()) {
        if (seenLineKeys.has(key)) {
          list.push(`Línea ${n}: producto y lote repetidos dentro de la misma compra.`);
        }
        seenLineKeys.add(key);
      }
    });

    return list;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationList = getValidationErrors();
    if (validationList.length > 0) {
      notifyValidationErrors(validationList);
      return;
    }

    const payload = {
      supplier_id: Number(purchaseHeader.supplier_id),
      invoice_number: purchaseHeader.invoice_number || null,
      purchase_date: purchaseHeader.purchase_date,
      total_amount: Number(grandTotal.toFixed(2)),
      currency: purchaseHeader.currency,
      notes: purchaseHeader.notes || null,
      items: linesWithTotals.map((line) => ({
        item_id: Number(line.item_id),
        quantity: Number(line.quantity),
        unit_cost: Number(line.unit_cost),
        batch_number: line.batch_number.trim(),
        expiration_date: line.expiration_date,
        subtotal: Number(line.subtotal.toFixed(2))
      }))
    };

    onSubmit?.(payload);
  };

  const handleQuickCreateSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) return;

    const rif = newSupplier.tax_id.trim();
    const phone = newSupplier.phone.trim();
    const email = newSupplier.email.trim();

    if (rif && !rifRegex.test(rif)) {
      toast.error('El RIF/Cedula del proveedor tiene un formato invalido.');
      return;
    }

    if (phone && !phoneRegex.test(phone)) {
      toast.error('El telefono del proveedor tiene un formato invalido.');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('El correo del proveedor no tiene un formato valido.');
      return;
    }

    const created = await onCreateSupplier?.(newSupplier);
    if (!created) return;

    if (created.id || created.supplier_id) {
      setHeaderValue('supplier_id', String(created.id || created.supplier_id));
    }

    setShowQuickSupplier(false);
    setNewSupplier({
      name: '',
      tax_id: '',
      contact_name: '',
      phone: '',
      email: '',
      address: ''
    });
    toast.success('Proveedor agregado al selector de compra.');
  };

  return (
    <Modal open={open} title="Registrar abastecimiento" onClose={onClose} maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40 p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-emerald-900">
            <PackagePlus className="h-4 w-4" />
            Registro de compra y lotes
          </div>
          <div className="flex flex-col gap-2 text-xs text-emerald-700 sm:flex-row sm:items-center sm:justify-between">
            <p>Carga la factura, distribuye los productos por lote y procesa todo en una sola operación.</p>
          </div>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 text-sm font-semibold text-gray-800">Datos de cabecera</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Proveedor *</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Truck className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  required
                  value={purchaseHeader.supplier_id}
                  onChange={(e) => setHeaderValue('supplier_id', e.target.value)}
                  className="block w-full rounded-xl border-gray-300 py-2.5 pl-9 pr-3 text-sm shadow-sm transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Selecciona proveedor</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickSupplier((v) => !v)}
                className="rounded-xl border border-gray-300 px-3 text-gray-600 transition-all duration-300 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-700"
                title="Agregar proveedor rápido"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
            </div>

            <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Numero de Factura</label>
            <div className="relative">
              <ReceiptText className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={purchaseHeader.invoice_number}
                onChange={(e) => setHeaderValue('invoice_number', e.target.value)}
                className="block w-full rounded-xl border-gray-300 py-2.5 pl-9 pr-3 text-sm shadow-sm transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Ej. FAC-000123"
              />
            </div>
            </div>

            <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Fecha *</label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                required
                value={purchaseHeader.purchase_date}
                onChange={(e) => setHeaderValue('purchase_date', e.target.value)}
                className="block w-full rounded-xl border-gray-300 py-2.5 pl-9 pr-3 text-sm shadow-sm transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            </div>
          </div>
        </section>

        {showQuickSupplier && (
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-indigo-900">Registro rápido de proveedor</div>
              <span className="text-xs text-indigo-700">Se agrega al selector al guardar</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                type="text"
                required
                value={newSupplier.name}
                onChange={(e) => setNewSupplier((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nombre *"
                className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm"
              />
              <input
                type="text"
                value={newSupplier.tax_id}
                onChange={(e) => setNewSupplier((p) => ({ ...p, tax_id: e.target.value }))}
                placeholder="RIF"
                className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm"
              />
              <input
                type="text"
                value={newSupplier.contact_name}
                onChange={(e) => setNewSupplier((p) => ({ ...p, contact_name: e.target.value }))}
                placeholder="Contacto"
                className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm"
              />
              <input
                type="text"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Teléfono"
                className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm"
              />
              <input
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier((p) => ({ ...p, email: e.target.value }))}
                placeholder="Correo"
                className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm md:col-span-2"
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickSupplier(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={creatingSupplier || !newSupplier.name.trim()}
                onClick={handleQuickCreateSupplier}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-indigo-700 disabled:opacity-60"
              >
                {creatingSupplier ? 'Guardando...' : 'Guardar proveedor'}
              </button>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
            <div className="text-sm font-semibold text-gray-700">Detalle de productos</div>
            <div className="text-xs text-gray-500">{lines.length} línea(s)</div>
          </div>
          <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">Producto *</th>
                <th className="px-3 py-2 text-left">Cantidad *</th>
                <th className="px-3 py-2 text-left">Costo Unitario *</th>
                <th className="px-3 py-2 text-left">Número de Lote *</th>
                <th className="px-3 py-2 text-left">Vencimiento *</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
                <th className="px-3 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {linesWithTotals.map((line, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    <select
                      value={line.item_id}
                      onChange={(e) => setLineValue(index, 'item_id', e.target.value)}
                      className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Selecciona producto</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="1"
                      onKeyDown={preventNegativeInput}
                      onPaste={preventNegativePaste}
                      value={line.quantity}
                      onChange={(e) => setLineValue(index, 'quantity', Number(e.target.value || 1))}
                      className="w-28 rounded-lg border-gray-300 px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      onKeyDown={preventNegativeInput}
                      onPaste={preventNegativePaste}
                      value={line.unit_cost}
                      onChange={(e) => setLineValue(index, 'unit_cost', Number(e.target.value || 0))}
                      className="w-32 rounded-lg border-gray-300 px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={line.batch_number}
                      onChange={(e) => setLineValue(index, 'batch_number', e.target.value)}
                      className="w-44 rounded-lg border-gray-300 px-3 py-2 text-sm"
                      placeholder="Ej. L-2026-AB"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={line.expiration_date}
                      onChange={(e) => setLineValue(index, 'expiration_date', e.target.value)}
                      className="w-40 rounded-lg border-gray-300 px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-800">
                    ${line.subtotal.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      title="Eliminar línea"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-4">
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:border-emerald-300 hover:text-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Agregar producto
          </button>

          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2 text-right">
            <div className="text-xs font-medium text-emerald-700">Total general</div>
            <div className="text-xl font-bold text-emerald-700">${grandTotal.toFixed(2)}</div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Notas</label>
          <textarea
            rows={2}
            value={purchaseHeader.notes}
            onChange={(e) => setHeaderValue('notes', e.target.value)}
            className="block w-full rounded-xl border-gray-300 px-3 py-2.5 text-sm"
            placeholder="Observaciones de la compra"
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? <Save className="h-4 w-4 animate-pulse" /> : <PackagePlus className="h-4 w-4" />}
            {submitting ? 'Procesando...' : 'Procesar Compra'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
