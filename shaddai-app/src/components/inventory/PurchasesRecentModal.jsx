import React from 'react';
import { CalendarDays, ClipboardList, Truck } from 'lucide-react';
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

function formatearCantidad(valor) {
  const cantidad = Number(valor || 0);
  if (!Number.isFinite(cantidad)) return '0';
  return cantidad.toLocaleString('es-VE');
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

function getStatusPillClass(estado) {
  switch (estado) {
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 border border-rose-200';
    case 'pending':
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'received':
    default:
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  }
}

function getBatchAvailabilityMeta(batch) {
  const purchasedRaw = Number(batch?.initial_quantity ?? batch?.quantity ?? 0);
  const availableRaw = Number(batch?.quantity ?? 0);

  const purchased = Number.isFinite(purchasedRaw) && purchasedRaw > 0 ? purchasedRaw : 0;
  const available = Number.isFinite(availableRaw) && availableRaw > 0 ? availableRaw : 0;

  const reference = purchased > 0 ? purchased : Math.max(available, 1);
  const consumed = Math.max(reference - available, 0);
  const ratio = Math.max(0, Math.min(100, Math.round((available / reference) * 100)));

  if (available === 0) {
    return {
      purchased: reference,
      available,
      consumed,
      ratio,
      label: 'Agotado',
      badgeClass: 'bg-rose-100 text-rose-700 border border-rose-200',
      barClass: 'bg-rose-500'
    };
  }

  if (available < reference) {
    return {
      purchased: reference,
      available,
      consumed,
      ratio,
      label: 'Parcial',
      badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
      barClass: 'bg-amber-500'
    };
  }

  return {
    purchased: reference,
    available,
    consumed,
    ratio,
    label: 'Intacto',
    badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    barClass: 'bg-emerald-500'
  };
}

export default function PurchasesRecentModal({
  open,
  onClose,
  purchases = [],
  loading = false,
  selectedPurchaseId = null,
  selectedPurchaseDetails = null,
  loadingDetails = false,
  onSelectPurchase,
  canPurchase = false,
  onOpenPurchase
}) {
  return (
    <>
      {/* Modal Principal: Lista de compras */}
      <Modal open={open} onClose={onClose} title="Compras recientes" maxWidth="max-w-3xl">
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-bold text-emerald-900">
              <ClipboardList className="h-4 w-4" />
              Historial de compras
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-emerald-700">
                Selecciona una compra para abrir su detalle en una vista dedicada.
              </p>
              <span className="rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                {purchases.length} registros
              </span>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="max-h-[400px] overflow-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Fecha</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Proveedor</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Factura</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                    <th className="px-4 py-2.5 text-center font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>Cargando compras...</td>
                    </tr>
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>No hay compras registradas.</td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr
                        key={purchase.id}
                        onClick={() => onSelectPurchase?.(purchase)}
                        className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-emerald-50/50"
                      >
                        <td className="px-4 py-3 text-gray-700">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                            {formatearFecha(purchase.purchase_date)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {purchase.supplier_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs font-mono">
                          {purchase.invoice_number || '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                          {formatearMonto(purchase.total_amount, purchase.currency || 'USD')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getStatusPillClass(purchase.status)}`}>
                            {traducirEstado(purchase.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
              <span>Mostrando compras recientes.</span>
              <span>Haz clic en una fila para ver el detalle</span>
            </div>
          </section>

          <div className="flex justify-end pt-1">
            {canPurchase && (
              <button
                type="button"
                onClick={onOpenPurchase}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <Truck className="h-4 w-4" />
                Registrar compra
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Secundario: Detalles de la compra */}
      <Modal
        open={!!selectedPurchaseId}
        onClose={() => onSelectPurchase({ id: selectedPurchaseId })}
        title="Detalle de compra"
        maxWidth="max-w-4xl"
      >
        {loadingDetails ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Cargando información detallada...
          </div>
        ) : !selectedPurchaseDetails ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No se encontraron datos para esta operación.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Proveedor</div>
                <div className="text-sm font-semibold text-gray-800">{selectedPurchaseDetails.purchase?.supplier_name || '-'}</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">N° de Factura</div>
                <div className="text-sm font-mono font-medium text-gray-700">{selectedPurchaseDetails.purchase?.invoice_number || '-'}</div>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-3">
                <div className="text-[11px] uppercase tracking-wide text-emerald-600 mb-1">Monto Total</div>
                <div className="text-sm font-bold text-emerald-700">
                  {formatearMonto(selectedPurchaseDetails.purchase?.total_amount, selectedPurchaseDetails.purchase?.currency || 'USD')}
                </div>
              </div>
            </div>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-600">
                <span>Insumos y lotes registrados</span>
                <span>{selectedPurchaseDetails.batches?.length || 0} ítems</span>
              </div>
              <div className="max-h-[320px] overflow-auto">
                {Array.isArray(selectedPurchaseDetails.batches) && selectedPurchaseDetails.batches.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {selectedPurchaseDetails.batches.map((batch) => {
                      const availability = getBatchAvailabilityMeta(batch);

                      return (
                        <article key={batch.id} className="space-y-3 p-4 transition-colors hover:bg-gray-50/60">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{batch.item_name || '-'}</div>
                              <div className="text-xs text-gray-500">
                                Lote {batch.batch_number || 'S/N'} • Vence {formatearFecha(batch.expiration_date)}
                              </div>
                            </div>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${availability.badgeClass}`}>
                              {availability.label}
                            </span>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border border-sky-100 bg-sky-50 p-2.5">
                              <div className="text-[11px] uppercase tracking-wide text-sky-700">Cantidad comprada</div>
                              <div className="text-base font-bold text-sky-800">{formatearCantidad(availability.purchased)}</div>
                            </div>
                            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2.5">
                              <div className="text-[11px] uppercase tracking-wide text-emerald-700">Stock restante / disponible</div>
                              <div className="text-base font-bold text-emerald-800">{formatearCantidad(availability.available)}</div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-gray-500">
                              <span>Disponibilidad del lote</span>
                              <span>{availability.ratio}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${availability.barClass}`}
                                style={{ width: `${availability.ratio}%` }}
                              />
                            </div>
                            <div className="text-[11px] text-gray-500">
                              Consumido: {formatearCantidad(availability.consumed)}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    Esta compra no tiene lotes ingresados al stock.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </Modal>
    </>
  );
}

