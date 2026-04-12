import React, { useMemo, useState } from 'react';
import { CalendarDays, ClipboardList, Search, Truck, X, Eye, PackageOpen, Tag, Banknote, Clock, ArrowLeft } from 'lucide-react';

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

function getStatusPillClass(estado, variant = 'solid') {
  if (variant === 'solid') {
    switch (estado) {
      case 'cancelled': return 'bg-rose-100 text-rose-700 border border-rose-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'received': default: return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }
  } else {
    // subtle
    switch (estado) {
      case 'cancelled': return 'bg-white text-rose-600 border border-rose-200 shadow-sm';
      case 'pending': return 'bg-white text-amber-600 border border-amber-200 shadow-sm';
      case 'received': default: return 'bg-white text-emerald-600 border border-emerald-200 shadow-sm';
    }
  }
}

function getProductMeta(purchase) {
  const previewRaw = String(purchase?.product_preview || '');
  const previewList = previewRaw
    .split('||')
    .map((item) => item.trim())
    .filter(Boolean);

  const productCountRaw = Number(purchase?.product_count ?? 0);
  const productCount = Number.isFinite(productCountRaw) && productCountRaw > 0
    ? productCountRaw
    : previewList.length;

  const hiddenCount = Math.max(productCount - previewList.length, 0);

  return {
    previewList,
    productCount,
    hiddenCount
  };
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
      badgeClass: 'bg-rose-100 text-rose-700',
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
      badgeClass: 'bg-amber-100 text-amber-700',
      barClass: 'bg-amber-500'
    };
  }

  return {
    purchased: reference,
    available,
    consumed,
    ratio,
    label: 'Intacto',
    badgeClass: 'bg-emerald-100 text-emerald-700',
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
  const [quickSearch, setQuickSearch] = useState('');

  const filteredPurchases = useMemo(() => {
    const term = quickSearch.trim().toLowerCase();
    if (!term) return purchases;

    return purchases.filter((purchase) => {
      const searchable = [
        purchase?.supplier_name,
        purchase?.invoice_number,
        purchase?.purchase_date,
        purchase?.product_preview,
        purchase?.status
      ]
        .map((value) => String(value || '').toLowerCase())
        .join(' ');

      return searchable.includes(term);
    });
  }, [purchases, quickSearch]);

  const view = selectedPurchaseId ? 'detail' : 'list';

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={(e) => { e.stopPropagation(); onClose(); }} />
      
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Dinámico */}
        <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-start z-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {view === 'detail' ? (
                <button 
                  onClick={() => onSelectPurchase({ id: null })}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors mr-1"
                  title="Volver a la lista"
                >
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <ClipboardList size={20} />
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {view === 'detail' 
                    ? `Detalle de Compra ${selectedPurchaseDetails?.purchase?.invoice_number ? '#' + selectedPurchaseDetails.purchase.invoice_number : ''}` 
                    : 'Historial y Compras Recientes'}
              </h2>
            </div>
            
            <p className="text-sm text-gray-500 ml-11">
              {view === 'detail' ? 'Información detallada de la adquisición y sus lotes ingresados.' : 'Listado de insumos que han ingresado al inventario.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {view === 'list' && canPurchase && (
                 <button 
                  onClick={onOpenPurchase}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all flex items-center gap-2"
                >
                  <Truck size={16} />
                  <span className="hidden sm:inline">Nueva Compra</span>
                </button>
             )}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {view === 'list' && (
             <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-md w-full animate-in fade-in slide-in-from-right-4 duration-300">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por proveedor, N° factura, producto..."
                        value={quickSearch}
                        onChange={(e) => setQuickSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                </div>
            </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 p-0 relative">
          {view === 'list' ? (
            loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                  <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 font-medium">Cargando historial de compras...</p>
                </div>
            ) : filteredPurchases.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <ClipboardList className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-semibold text-lg">No hay compras registradas</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                    {quickSearch ? 'Ajusta tu búsqueda para encontrar resultados.' : 'Acá aparecerán todas las compras y recepciones en el almacén.'}
                  </p>
                </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap min-w-[800px]">
                  <thead className="sticky top-0 bg-white shadow-sm border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left">Fecha</th>
                      <th className="px-6 py-4 text-left">Proveedor</th>
                      <th className="px-6 py-4 text-left">Productos Ingresados</th>
                      <th className="px-6 py-4 text-left">Factura</th>
                      <th className="px-6 py-4 text-right">Monto Total</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-6 py-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPurchases.map((purchase) => {
                        const productMeta = getProductMeta(purchase);
                        return (
                            <tr
                                key={purchase.id}
                                className="group cursor-pointer bg-white hover:bg-emerald-50/40 transition-colors"
                                onClick={() => onSelectPurchase?.(purchase)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                                        <CalendarDays className="h-4 w-4 text-emerald-500" />
                                        {formatearFecha(purchase.purchase_date)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-800 font-semibold truncate max-w-[200px]">
                                    {purchase.supplier_name || <span className="text-gray-400 font-normal italic">Sin proveedor</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {productMeta.previewList.slice(0, 3).map((name, i) => (
                                                <div 
                                                    key={i} 
                                                    className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center shadow-sm relative z-0"
                                                    title={name}
                                                >
                                                    <PackageOpen size={14} className="text-gray-500"/>
                                                </div>
                                            ))}
                                            {productMeta.hiddenCount > 0 && (
                                                <div className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm relative z-10">
                                                    +{productMeta.hiddenCount}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium ml-2">
                                            {productMeta.productCount} ítem{productMeta.productCount !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-mono text-xs font-semibold">
                                    {purchase.invoice_number || '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-bold text-emerald-700">
                                        {formatearMonto(purchase.total_amount, purchase.currency || 'USD')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center justify-center min-w-[90px] rounded-lg px-2.5 py-1 text-xs font-bold leading-tight ${getStatusPillClass(purchase.status)}`}>
                                        {traducirEstado(purchase.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 bg-white border border-gray-200 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200">
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* DETAIL VIEW */
            <div className="p-6 animate-in slide-in-from-right-8 duration-300">
                 {loadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                        <p className="text-sm text-gray-500 font-medium">Cargando detalle completo...</p>
                    </div>
                 ) : !selectedPurchaseDetails ? (
                    <div className="py-12 text-center text-sm text-gray-500">
                        No se encontraron datos detallados para esta compra.
                    </div>
                 ) : (
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl text-gray-600 shrink-0">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Proveedor</div>
                                    <div className="text-sm font-semibold text-gray-900 leading-snug">
                                        {selectedPurchaseDetails.purchase?.supplier_name || <span className="text-gray-400 italic">Sin especificar</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Factura Recibida</div>
                                    <div className="text-sm font-semibold font-mono text-gray-900 leading-snug">
                                        {selectedPurchaseDetails.purchase?.invoice_number || <span className="text-gray-400 italic">Sin N°</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-orange-50 rounded-xl text-orange-600 shrink-0">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Fecha Ingreso</div>
                                    <div className="text-sm font-semibold text-gray-900 leading-snug">
                                        {formatearFecha(selectedPurchaseDetails.purchase?.purchase_date)}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-md text-white flex items-start gap-4">
                                <div className="p-3 bg-white/20 rounded-xl text-white shrink-0 backdrop-blur-sm">
                                    <Banknote size={20} />
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-emerald-100 font-bold mb-1">Total Pagado</div>
                                    <div className="text-lg font-bold leading-snug tracking-tight">
                                        {formatearMonto(selectedPurchaseDetails.purchase?.total_amount, selectedPurchaseDetails.purchase?.currency || 'USD')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detalle de Productos/Lotes en formato Grid Card o Lista elegante */}
                        <div>
                            <div className="flex items-center justify-between mb-4 mt-2 px-1">
                                <h3 className="text-base font-bold text-gray-900">Insumos Adquiridos (Lotes)</h3>
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                    {selectedPurchaseDetails.batches?.length || 0} ingresados
                                </span>
                            </div>

                            {Array.isArray(selectedPurchaseDetails.batches) && selectedPurchaseDetails.batches.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {selectedPurchaseDetails.batches.map((batch) => {
                                        const availability = getBatchAvailabilityMeta(batch);
                                        return (
                                            <div key={batch.id} className="bg-white border text-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xl border border-emerald-100 flex-shrink-0">
                                                            {batch.item_name?.charAt(0) || 'P'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg mb-1 leading-tight">{batch.item_name}</h4>
                                                            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                                                                <span>Lote: <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded ml-1">{batch.batch_number || 'S/N'}</span></span>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                <span className="flex items-center gap-1 text-orange-600">
                                                                    <CalendarDays size={12}/> Vence {formatearFecha(batch.expiration_date)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-start sm:items-end">
                                                         <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${availability.badgeClass}`}>
                                                            {availability.label}
                                                         </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                                                    <div>
                                                        <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Stock Adquirido</div>
                                                        <div className="text-lg font-bold text-gray-900">
                                                            {formatearCantidad(availability.purchased)} <span className="text-xs font-normal text-gray-500">unids.</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs uppercase tracking-wider text-emerald-600 font-bold mb-1">Stock Actual</div>
                                                        <div className="text-lg font-bold text-emerald-700">
                                                            {formatearCantidad(availability.available)} <span className="text-xs font-normal text-emerald-600/70">unids.</span>
                                                        </div>
                                                    </div>

                                                    <div className="col-span-2 mt-2">
                                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-2">
                                                            <span className="text-gray-400">Consumo de este lote</span>
                                                            <span className={availability.ratio < 30 ? 'text-rose-500' : 'text-emerald-500'}>{availability.ratio}% disponible</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-700 ${availability.barClass}`}
                                                                style={{ width: `${availability.ratio}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-2xl">
                                    <PackageOpen className="mx-auto h-10 w-10 text-gray-300 mb-2"/>
                                    <p className="text-sm font-semibold text-gray-600">No hay lotes asociados a esta compra.</p>
                                </div>
                            )}
                        </div>
                     </div>
                 )}
            </div>
          )}
        </div>

        {/* Footer */}
        {view === 'list' && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200 z-10 text-xs font-medium text-gray-500 font-mono">
                {filteredPurchases.length} documentos encontrados.
            </div>
        )}
      </div>
    </div>
  );
}