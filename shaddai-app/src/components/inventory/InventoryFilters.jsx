import React from 'react';
import { Search, Filter, AlertTriangle, Tag, Download, Plus, XCircle, FileText, Bookmark, Bell } from 'lucide-react';
import { preventNegativeInput, preventNegativePaste } from '../../utils/formUtils';

export default function InventoryFilters({
    search, setSearch,
    showFilters, setShowFilters,
    lowStockOnly, setLowStockOnly,
    filters, setFilters,
    brands,
    canEdit,
    onShowBrandModal,
    onShowAlerts,
    onOpenReports,
    onCreate
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 sticky top-4 z-30">
            <div className="p-2 flex flex-col lg:flex-row gap-3 items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative w-full lg:w-96 group p-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-2.5 border-0 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white rounded-xl transition-all duration-300 text-sm font-medium"
                        placeholder="Buscar por nombre, código, marca..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end p-1">
                    
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                            showFilters 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-inner' 
                            : 'bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:border-gray-200'
                        }`}
                    >
                        <Filter size={18} className={`transition-transform duration-300 ${showFilters ? 'rotate-180 text-indigo-600' : ''}`} />
                        <span>Filtros</span>
                        {(filters.name || filters.code || filters.brand_id || filters.status || filters.min_price || filters.max_price || lowStockOnly) && (
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        )}
                    </button>

                    <div className="h-6 w-px bg-gray-200 hidden sm:block mx-1"></div>

                    {canEdit && (
                        <>
                            <button 
                                onClick={onShowBrandModal}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-600 border border-transparent hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 rounded-xl transition-all duration-300 shadow-sm"
                                title="Gestionar Marcas"
                            >
                                <Bookmark size={18} />
                                <span className="hidden sm:inline font-medium">Marcas</span>
                            </button>

                            <button 
                                onClick={onShowAlerts}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-600 border border-transparent hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 rounded-xl transition-all duration-300 shadow-sm"
                                title="Alertas de Vencimiento"
                            >
                                <Bell size={18} />
                                <span className="hidden sm:inline font-medium">Alertas</span>
                            </button>
                        </>
                    )}

                    <button 
                        onClick={onOpenReports}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-600 border border-transparent hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 rounded-xl transition-all duration-300 shadow-sm"
                        title="Reportes y Análisis"
                    >
                        <FileText size={18} />
                        <span className="hidden sm:inline font-medium">Reportes</span>
                    </button>

                    {canEdit && (
                        <button
                            onClick={onCreate}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 transform hover:-translate-y-0.5 font-medium text-sm ml-2"
                        >
                            <Plus size={20} />
                            <span className="hidden sm:inline">Nuevo</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Filters Panel (Collapsible) */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? 'max-h-[600px] opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Filter size={16} className="text-indigo-600"/> 
                            Filtros Avanzados
                        </h3>
                        <button 
                            onClick={() => {
                                setFilters({ name: '', code: '', status: '', brand_id: '', min_price: '', max_price: '' });
                                setSearch('');
                                setLowStockOnly(false);
                            }}
                            className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <XCircle size={14} /> Limpiar Todo
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Nombre</label>
                            <input 
                                type="text" 
                                value={filters.name}
                                onChange={e => setFilters({...filters, name: e.target.value})}
                                className="w-full rounded-xl px-4 border-gray-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm py-2.5"
                                placeholder="Ej. Paracetamol"
                            />
                        </div>
                        
                        {/* Code */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Código</label>
                            <input 
                                type="text" 
                                value={filters.code}
                                onChange={e => setFilters({...filters, code: e.target.value})}
                                className="w-full rounded-xl px-4 border-gray-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm py-2.5"
                                placeholder="Ej. MED-001"
                            />
                        </div>

                        {/* Brand */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Marca</label>
                            <div className="relative">
                                <select 
                                    value={filters.brand_id}
                                    onChange={e => setFilters({...filters, brand_id: e.target.value})}
                                    className="w-full rounded-xl px-4 border-gray-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm py-2.5 appearance-none"
                                >
                                    <option value="">Todas las marcas</option>
                                    {Array.isArray(brands) && brands.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                    <Tag size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Estado</label>
                            <select 
                                value={filters.status}
                                onChange={e => setFilters({...filters, status: e.target.value})}
                                className="w-full rounded-xl px-4 border-gray-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm py-2.5"
                            >
                                <option value="">Todos los estados</option>
                                <option value="active">Solo Activos</option>
                                <option value="inactive">Solo Inactivos</option>
                            </select>
                        </div>

                        {/* Low Stock Toggle */}
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={lowStockOnly}
                                        onChange={(e) => setLowStockOnly(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </div>
                                <span className={`text-sm font-medium transition-colors ${lowStockOnly ? 'text-red-700' : 'text-gray-600 group-hover:text-gray-800'}`}>
                                    Solo Bajo Stock
                                </span>
                            </label>
                        </div>

                        {/* Price Range */}
                        <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-gray-100 mt-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">
                                Rango de Precio (USD)
                            </label>
                            <div className="flex items-center gap-4 max-w-md">
                                {/* INPUT MINIMO */}
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        placeholder="Min"
                                        value={filters.min_price}
                                        onChange={e => setFilters({...filters, min_price: e.target.value})}
                                        onKeyDown={preventNegativeInput}
                                        onPaste={preventNegativePaste}
                                        className="w-full rounded-xl border-gray-200 bg-white text-sm pl-7 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm py-2"
                                    />
                                </div>

                                <span className="text-gray-400 font-medium">-</span>

                                {/* INPUT MAXIMO */}
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        placeholder="Max"
                                        value={filters.max_price}
                                        onChange={e => setFilters({...filters, max_price: e.target.value})}
                                        onKeyDown={preventNegativeInput}
                                        onPaste={preventNegativePaste}
                                        className="w-full rounded-xl border-gray-200 bg-white text-sm pl-7 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm py-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
