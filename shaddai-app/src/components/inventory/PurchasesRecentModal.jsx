import React from 'react';
import { CalendarDays, ClipboardList, PackageSearch, ReceiptText, Truck } from 'lucide-react';
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
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-bold text-emerald-900">
              <ClipboardList className="h-4 w-4" />
              Historial de compras
            </div>
            <p className="text-xs text-emerald-700">
              Consulta las compras más recientes y haz clic en ellas para ver sus detalles y lotes.
            </p>
          </div>

          <section className="rounded-2xl border border-gray-200 overflow-hidden">
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
                        className={`cursor-pointer border-b border-gray-50 transition-colors hover:bg-emerald-50/50`}
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
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
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
              <span>{purchases.length} registros listados.</span>
              <span>Haz clic en una fila para ver el detalle</span>
            </div>
          </section>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            {canPurchase && (
              <button
                type="button"
                onClick={onOpenPurchase}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <Truck className="h-4 w-4" />
                Registrar compra
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Secundario: Detalles de la compra */}
      <Modal 
        open={!!selectedPurchaseId} 
        onClose={() => onSelectPurchase({ id: selectedPurchaseId })} 
        title="Detalle de compra" 
        maxWidth="max-w-2xl"
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
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Proveedor</div>
                <div className="text-sm font-semibold text-gray-800">{selectedPurchaseDetails.purchase?.supplier_name || '-'}</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">N° de Factura</div>
                <div className="text-sm font-mono font-medium text-gray-700">{selectedPurchaseDetails.purchase?.invoice_number || '-'}</div>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <div className="text-[11px] uppercase tracking-wide text-emerald-600 mb-1">Monto Total</div>
                <div className="text-sm font-bold text-emerald-700">
                  {formatearMonto(selectedPurchaseDetails.purchase?.total_amount, selectedPurchaseDetails.purchase?.currency || 'USD')}
                </div>
              </div>
            </div>

            <section className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-600">
                <span>Insumos y lotes registrados</span>
                <span>{selectedPurchaseDetails.batches?.length || 0} ítems</span>
              </div>
              <div className="max-h-[240px] overflow-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead className="bg-white border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Producto / Insumo</th>
                      <th className="px-4 py-2 text-left font-semibold">Lote</th>
                      <th className="px-4 py-2 text-right font-semibold">Cantidad</th>
                      <th className="px-4 py-2 text-left font-semibold">Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selectedPurchaseDetails.batches) && selectedPurchaseDetails.batches.length > 0 ? (
                      selectedPurchaseDetails.batches.map((batch) => (
                        <tr key={batch.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 text-gray-800 font-medium">
                            {batch.item_name || '-'}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600 font-mono text-xs">
                            {batch.batch_number || '-'}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-700 font-semibold">
                            {Number(batch.quantity || 0)}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600 text-xs">
                            {formatearFecha(batch.expiration_date)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                          Esta compra no tiene lotes ingresados al stock.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="pt-2 text-right border-t border-gray-100">
              <button
                type="button"
                onClick={() => onSelectPurchase({ id: selectedPurchaseId })}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-700"
              >
                Cerrar detalle
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

