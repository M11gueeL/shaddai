import React from 'react';
import { Package, Loader2 } from 'lucide-react';

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
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600">
            <th className="text-left font-medium px-4 py-3">Nombre</th>
            <th className="text-left font-medium px-4 py-3">Código</th>
            <th className="text-left font-medium px-4 py-3">Stock</th>
            <th className="text-left font-medium px-4 py-3">UM</th>
            <th className="text-left font-medium px-4 py-3">Reorden</th>
            <th className="text-left font-medium px-4 py-3">Precio USD</th>
            <th className="text-left font-medium px-4 py-3">Estado</th>
            <th className="text-right font-medium px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map(item => {
            const low = item.stock_quantity <= item.reorder_level;
            return (
              <tr key={item.id} className="hover:bg-indigo-50/40 transition">
                <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[220px] truncate" title={item.name}>{item.name}</td>
                <td className="px-4 py-2.5 text-gray-500">{item.code || '-'}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${low ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>{item.stock_quantity}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-600">{item.unit_of_measure}</td>
                <td className="px-4 py-2.5 text-gray-600">{item.reorder_level}</td>
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
  );
}
