import React from 'react';
import { Package, Loader2, AlertTriangle } from 'lucide-react';

export default function InventoryTable({ items, onEdit, onDelete, onRestock, onMovements, loading, canEdit }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-16 border border-dashed rounded-2xl bg-white/60">
        <Package className="w-10 h-10 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 text-sm">No hay insumos que mostrar.</p>
      </div>
    );
  }

  // Función auxiliar para chequear vencimiento
  const isExpired = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const expDate = new Date(dateString);
    return expDate < today;
  };

  return (
    <div className="space-y-4">
      {/* Vista Móvil */}
      <div className="md:hidden space-y-3">
        {items.map((item) => {
          const low = item.stock_quantity <= item.reorder_level;
          const expired = isExpired(item.next_expiration);
          
          return (
            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-base font-semibold leading-snug text-gray-900 break-words">{item.name}</p>
                  <p className="text-xs text-gray-500">Código: {item.code || '—'}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className={`rounded-xl border px-3 py-2 ${low ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                  <p className="text-sm font-semibold">{item.stock_quantity}</p>
                  <p className="text-[11px] uppercase tracking-wide">Stock</p>
                </div>
                {/* Nuevo bloque de vencimiento en móvil */}
                <div className={`rounded-xl border px-3 py-2 ${expired ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                   <p className="text-sm font-semibold flex items-center gap-1">
                     {expired && <AlertTriangle className="w-3 h-3" />}
                     {item.next_expiration || 'N/A'}
                   </p>
                   <p className="text-[11px] uppercase tracking-wide">Vence</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                  <p className="text-sm font-semibold">{item.unit_of_measure}</p>
                  <p className="text-[11px] uppercase tracking-wide">Unidad</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                  <p className="text-sm font-semibold">${Number(item.price_usd).toFixed(2)}</p>
                  <p className="text-[11px] uppercase tracking-wide">Precio USD</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => onMovements(item)} className="flex-1 min-w-[120px] rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 flex items-center justify-center">Movimientos</button>
                {canEdit && (
                  <>
                    <button onClick={() => onRestock(item)} className="flex-1 min-w-[120px] rounded-lg bg-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-200 flex items-center justify-center">+ Stock</button>
                    <button onClick={() => onEdit(item)} className="flex-1 min-w-[120px] rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-200 flex items-center justify-center">Editar</button>
                    <button onClick={() => onDelete(item)} className="flex-1 min-w-[120px] rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 flex items-center justify-center">Borrar</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vista Escritorio */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left font-medium px-4 py-3">Nombre</th>
                <th className="text-left font-medium px-4 py-3">Código</th>
                <th className="text-left font-medium px-4 py-3">Stock</th>
                <th className="text-left font-medium px-4 py-3">Vencimiento</th>
                <th className="text-left font-medium px-4 py-3">UM</th>
                <th className="text-left font-medium px-4 py-3">Precio USD</th>
                <th className="text-left font-medium px-4 py-3">Estado</th>
                <th className="text-right font-medium px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const low = item.stock_quantity <= item.reorder_level;
                const expired = isExpired(item.next_expiration);

                return (
                  <tr key={item.id} className="hover:bg-indigo-50/40 transition">
                    <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[220px] truncate" title={item.name}>{item.name}</td>
                    <td className="px-4 py-2.5 text-gray-500">{item.code || '-'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${low ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>{item.stock_quantity}</span>
                    </td>
                    {/* Celda de Vencimiento */}
                    <td className={`px-4 py-2.5 ${expired ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                      {expired && <AlertTriangle className="inline w-3 h-3 mr-1" />}
                      {item.next_expiration || '-'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{item.unit_of_measure}</td>
                    <td className="px-4 py-2.5 text-gray-700">${Number(item.price_usd).toFixed(2)}</td>
                    <td className="px-4 py-2.5">
                      {item.is_active ? <span className="text-emerald-600 text-xs font-semibold">Activo</span> : <span className="text-gray-400 text-xs font-semibold">Inactivo</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => onMovements(item)} className="px-2 py-1.5 rounded-md text-xs bg-slate-100 hover:bg-slate-200 text-slate-700">Mov</button>
                        {canEdit && (
                          <>
                            <button onClick={() => onRestock(item)} className="px-2 py-1.5 rounded-md text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700">+Stock</button>
                            <button onClick={() => onEdit(item)} className="px-2 py-1.5 rounded-md text-xs bg-blue-100 hover:bg-blue-200 text-blue-700">Editar</button>
                            <button onClick={() => onDelete(item)} className="px-2 py-1.5 rounded-md text-xs bg-red-100 hover:bg-red-200 text-red-700">Borrar</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}