import React from 'react';
import { 
    Package, Loader2, MoreVertical, Edit, Trash2, 
    Archive, History, Layers, PlusCircle, AlertCircle 
} from 'lucide-react';

export default function InventoryTable({ items, onEdit, onDelete, onRestock, onMovements, onManageBatches, loading, canEdit }) {
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-gray-500 font-medium">Cargando inventario...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
        <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
            <Package className="w-12 h-12 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No hay insumos encontrados</h3>
        <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">Intenta ajustar los filtros de búsqueda o agrega un nuevo insumo al inventario.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4 p-4 bg-gray-50/50">
        {items.map((item) => {
          const low = item.stock_quantity <= item.reorder_level;
          
          return (
            <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
              {/* Status Stripe */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.is_active ? (low ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-gray-300'}`}></div>
              
              <div className="pl-3">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{item.code || 'S/C'}</span>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">{item.brand_name || 'Genérico'}</span>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl border ${low ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                        <span className={`block text-xs font-semibold uppercase mb-0.5 ${low ? 'text-amber-700' : 'text-emerald-700'}`}>Stock</span>
                        <div className="flex items-center gap-1.5">
                            <span className={`text-lg font-bold ${low ? 'text-amber-800' : 'text-emerald-800'}`}>{item.stock_quantity}</span>
                            {low && <AlertCircle size={14} className="text-amber-600" />}
                        </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="block text-xs font-semibold text-gray-500 uppercase mb-0.5">Precio</span>
                        <span className="text-lg font-bold text-gray-700">${Number(item.price_usd).toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="block text-xs font-semibold text-gray-500 uppercase mb-0.5">Unidad</span>
                        <span className="text-sm font-bold text-gray-700 mt-1 block truncate" title={item.unit_of_measure}>{item.unit_of_measure}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button onClick={() => onMovements(item)} className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <History size={14} /> Historial
                    </button>
                    <button onClick={() => onManageBatches(item)} className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <Layers size={14} /> Lotes
                    </button>
                    {canEdit && (
                        <button onClick={() => onRestock(item)} className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors whitespace-nowrap">
                            <PlusCircle size={14} /> Stock
                        </button>
                    )}
                </div>
                
                {canEdit && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                        <button onClick={() => onEdit(item)} className="flex-1 text-blue-600 text-xs font-medium py-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                            Editar
                        </button>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <button onClick={() => onDelete(item)} className="flex-1 text-red-600 text-xs font-medium py-1.5 hover:bg-red-50 rounded-lg transition-colors">
                            Desactivar
                        </button>
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="px-6 py-4 rounded-tl-2xl">Producto</th>
              <th className="px-6 py-4">Marca</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right rounded-tr-2xl">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {items.map((item) => {
              const low = item.stock_quantity <= item.reorder_level;

              return (
                <tr key={item.id} className="group hover:bg-indigo-50/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                        <span className="text-xs text-gray-500 font-mono mt-0.5">{item.code || 'S/C'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {item.brand_name || 'Genérico'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold ${low ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {item.stock_quantity}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase">{item.unit_of_measure}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-700 font-mono">
                        ${Number(item.price_usd).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.is_active 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {item.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onMovements(item)} 
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Ver Historial"
                        >
                            <History size={18} />
                        </button>
                        <button 
                            onClick={() => onManageBatches(item)} 
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Gestionar Lotes"
                        >
                            <Layers size={18} />
                        </button>
                        
                        {canEdit && (
                            <>
                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                <button 
                                    onClick={() => onRestock(item)} 
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Abastecer Stock"
                                >
                                    <PlusCircle size={18} />
                                </button>
                                <button 
                                    onClick={() => onEdit(item)} 
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </button>
                                <button 
                                    onClick={() => onDelete(item)} 
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Desactivar"
                                >
                                    <Trash2 size={18} />
                                </button>
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
  );
}