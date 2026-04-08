import React from 'react';
import { CalendarDays, ClipboardList, ReceiptText, Truck } from 'lucide-react';
import Modal from './Modal';

function formatearFecha(valor) {
  if (!valor) return '-';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString('es-VE');
}

function formatearMonto(monto, moneda = 'USD') {
  const valor = Number(monto || 0);
  return `${moneda} ${valor.toFixed(2)}`;
}

function traducirEstado(estado) {
  if (!estado) return 'Recibida';
  const mapa = {
    received: 'Recibida',
    pending: 'Pendiente',
    cancelled: 'Anulada'
  };
  return mapa[estado] || estado;
}

export default function PurchasesRecentModal({
  open,
  onClose,
  purchases = [],
  loading = false,
  canPurchase = false,
  onOpenPurchase
}) {
  return (
    <Modal open={open} onClose={onClose} title="Compras recientes" maxWidth="max-w-2xl">
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-emerald-900">
            <ClipboardList className="h-4 w-4" />
            Historial de compras
          </div>
          <p className="text-xs text-emerald-700">
            Consulta las compras más recientes y sus datos de factura.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-200 overflow-hidden">
          <header className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
            <div className="text-sm font-semibold text-gray-700">Listado de compras</div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200">
              {purchases.length} registros
            </span>
          </header>

          <div className="max-h-[430px] overflow-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="sticky top-0 bg-white border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Proveedor</th>
                  <th className="px-4 py-2 text-left">Factura</th>
                  <th className="px-4 py-2 text-right">Monto total</th>
                  <th className="px-4 py-2 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>Cargando compras...</td>
                  </tr>
                ) : purchases.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>No hay compras registradas.</td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                      <td className="px-4 py-2.5 text-gray-700">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                          {formatearFecha(purchase.purchase_date)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">{purchase.supplier_name || '-'}</td>
                      <td className="px-4 py-2.5 text-gray-600">{purchase.invoice_number || '-'}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">
                        {formatearMonto(purchase.total_amount, purchase.currency || 'USD')}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {traducirEstado(purchase.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
          {canPurchase && (
            <button
              type="button"
              onClick={onOpenPurchase}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <Truck className="h-4 w-4" />
              Registrar nueva compra
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
