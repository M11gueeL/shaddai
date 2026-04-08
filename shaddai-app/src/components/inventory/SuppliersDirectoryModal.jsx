import React from 'react';
import { Building2, Pencil, Plus, ReceiptText } from 'lucide-react';
import Modal from './Modal';

export default function SuppliersDirectoryModal({
  open,
  onClose,
  suppliers = [],
  loading = false,
  canCreate = false,
  canEdit = false,
  onOpenCreateSupplier,
  onEditSupplier
}) {
  return (
    <Modal open={open} onClose={onClose} title="Directorio de proveedores" maxWidth="max-w-xl">
      <div className="space-y-5">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-indigo-900">
            <Building2 className="h-4 w-4" />
            Proveedores registrados
          </div>
          <p className="text-xs text-indigo-700">
            Lista completa de proveedores activos e inactivos.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-200 overflow-hidden">
          <header className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
            <div className="text-sm font-semibold text-gray-700">Listado de proveedores</div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200">
              {suppliers.length} total
            </span>
          </header>

          <ul className="max-h-[430px] overflow-auto divide-y divide-gray-100">
            {loading ? (
              <li className="px-4 py-6 text-sm text-gray-500">Cargando proveedores...</li>
            ) : suppliers.length === 0 ? (
              <li className="px-4 py-6 text-sm text-gray-500">No hay proveedores disponibles.</li>
            ) : (
              suppliers.map((supplier) => (
                <li key={supplier.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-gray-800">{supplier.name}</div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {supplier.contact_name || supplier.phone || supplier.email || 'Sin datos de contacto'}
                      </div>
                      {supplier.tax_id && <div className="mt-1 text-xs text-gray-400">RIF: {supplier.tax_id}</div>}
                    </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            Number(supplier.is_active) === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {Number(supplier.is_active) === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => onEditSupplier?.(supplier)}
                            className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                            title="Editar proveedor"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
          {canCreate && (
            <button
              type="button"
              onClick={onOpenCreateSupplier}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <Plus className="h-4 w-4" />
              Registrar proveedor
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ReceiptText className="h-4 w-4" />
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
