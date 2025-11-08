import React from 'react';
import { Plus, Search, RefreshCcw, Loader2, Layers, Download } from 'lucide-react';

export default function InventoryActions({ onSearch, search, onToggleLowStock, lowStockOnly, onCreateClick, onRefresh, canEdit, exporting, onExport }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar insumo..."
            className="w-full bg-white/90 backdrop-blur border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
        <button
          onClick={onToggleLowStock}
          className={`px-4 py-2.5 text-sm rounded-xl border transition shadow-sm flex items-center gap-2 ${lowStockOnly ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          <Layers className="w-4 h-4" /> {lowStockOnly ? 'Stock Bajo' : 'Todos'}
        </button>
        <button
          onClick={onRefresh}
          className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" /> Recargar
        </button>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onExport}
          disabled={exporting}
          className="px-4 py-2.5 text-sm rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
        >
          {exporting ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />} Exportar CSV
        </button>
        {canEdit && (
          <button
            onClick={onCreateClick}
            className="px-5 py-2.5 text-sm rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium shadow hover:from-indigo-600 hover:to-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        )}
      </div>
    </div>
  );
}
