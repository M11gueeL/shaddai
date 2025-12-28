import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { listInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, restockInventoryItem, listInventoryMovements, getExpiringItems, getBrands } from '../../api/inventoryApi';
import { 
    Package, Search, Plus, Filter, Download, AlertTriangle, Tag, 
    RefreshCw, Layers, TrendingDown, Box, DollarSign, XCircle 
} from 'lucide-react';
import InventoryTable from './InventoryTable';
import Modal from './Modal';
import ItemForm from './ItemForm';
import RestockForm from './RestockForm';
import MovementsDrawer from './MovementsDrawer';
import ExpiringModal from './ExpiringModal';
import BatchManagementModal from './BatchManagementModal';
import BrandManagementModal from './BrandManagementModal';
import ElegantHeader from '../common/ElegantHeader';
import { preventNegativeInput, preventNegativePaste } from '../../utils/formUtils';

export default function InventoryPanel() {
    const { token, hasRole } = useAuth();
    const toast = useToast();
    const { confirm } = useConfirm();
    const canEdit = hasRole(['admin']);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [creating, setCreating] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [restockItem, setRestockItem] = useState(null);
    const [movementsItem, setMovementsItem] = useState(null);
    const [movements, setMovements] = useState([]);
    const [loadingMovements, setLoadingMovements] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showExpiringModal, setShowExpiringModal] = useState(false);
    const [expiringItems, setExpiringItems] = useState([]);
    const [loadingExpiring, setLoadingExpiring] = useState(false);
    const [batchItem, setBatchItem] = useState(null);
    const [showBrandModal, setShowBrandModal] = useState(false);

    // Advanced Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [brands, setBrands] = useState([]);
    const [filters, setFilters] = useState({
        name: '',
        code: '',
        status: '',
        brand_id: '',
        min_price: '',
        max_price: ''
    });

    // Fetch brands for filter
    useEffect(() => {
        if (token) {
            // Pass empty params object as first argument
            getBrands({}, token).then(res => setBrands(res.data || [])).catch(console.error);
        }
    }, [token]);

    // Auto-refresh interval (every 5 seconds)
    useEffect(() => {
        if (!token) return;
        const interval = setInterval(() => {
            // Silent refresh (don't set loading to true to avoid flickering)
            const params = { 
                all: 1, 
                low_stock: lowStockOnly ? 1 : undefined, 
                search: search || undefined,
                ...filters
            };
            listInventory(params, token).then(res => {
                if (res.data) setItems(res.data);
            }).catch(console.error);
        }, 5000);
        return () => clearInterval(interval);
    }, [token, lowStockOnly, search, filters]);

    const fetchInventory = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = { 
                all: 1, 
                low_stock: lowStockOnly ? 1 : undefined, 
                search: search || undefined,
                ...filters
            };
            const res = await listInventory(params, token);
            setItems(res.data || []);
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error cargando inventario');
        } finally {
            setLoading(false);
        }
    }, [token, lowStockOnly, search, filters, toast]);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    const handleCreate = async (data) => {
        try {
            const res = await createInventoryItem(data, token);
            if (res.data.message) {
                toast.info(res.data.message);
                return;
            }
            toast.success('Insumo creado exitosamente');
            setCreating(false);
            fetchInventory();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error creando insumo');
        }
    };

    const handleUpdate = async (data) => {
        try {
            const res = await updateInventoryItem(editingItem.id, data, token);
            if (res.data.message) {
                toast.info(res.data.message);
                return;
            }
            toast.success('Insumo actualizado');
            setEditingItem(null);
            fetchInventory();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error actualizando insumo');
        }
    };

    const handleDelete = async (item) => {
        const accepted = await confirm({
            title: `Eliminar ${item.name}`,
            message: 'Esta acción eliminará el insumo y podría afectar el historial. ¿Deseas continuar?',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            tone: 'danger'
        });
        if (!accepted) return;
        try {
            await deleteInventoryItem(item.id, token);
            toast.success('Insumo eliminado');
            fetchInventory();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error al eliminar');
        }
    };

    const handleRestock = async (formData) => {
        try {
            const res = await restockInventoryItem(restockItem.id, formData, token);
            if (res.data.message) {
                toast.info(res.data.message);
                return;
            }
            toast.success('Stock actualizado correctamente');
            setRestockItem(null);
            fetchInventory();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error en abastecimiento');
        }
    };

    const openMovements = async (item) => {
        setMovementsItem(item);
        setLoadingMovements(true);
        try {
            const res = await listInventoryMovements(item.id, { limit: 100 }, token);
            setMovements(res.data || []);
        } catch (e) {
            toast.error('Error cargando historial');
        } finally {
            setLoadingMovements(false);
        }
    };

    const exportCSV = () => {
        setExporting(true);
        try {
            const header = ['ID','Código','Nombre','Stock','Unidad','Punto Reorden','Precio USD','Estado','Marca'];
            const rows = items.map(i => [
                i.id, 
                i.code || '', 
                `"${i.name}"`, 
                i.stock_quantity, 
                i.unit_of_measure, 
                i.reorder_level, 
                i.price_usd, 
                i.is_active ? 'Activo' : 'Inactivo',
                i.brand_name || ''
            ]);
            const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Archivo CSV generado');
        } catch (e) {
            toast.error('Error al exportar');
        } finally {
            setExporting(false);
        }
    };

    const handleShowAlerts = async () => {
        setShowExpiringModal(true);
        setLoadingExpiring(true);
        try {
            const res = await getExpiringItems(token);
            setExpiringItems(res.data || []);
        } catch (e) {
            toast.error('Error cargando alertas de vencimiento');
        } finally {
            setLoadingExpiring(false);
        }
    };

    const totalItems = items.length;
    const lowCount = useMemo(() => items.filter(i => i.stock_quantity <= i.reorder_level).length, [items]);
    const totalValue = useMemo(() => items.reduce((acc, i) => acc + (parseFloat(i.price_usd || 0) * i.stock_quantity), 0), [items]);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
                
                {/* Header Section */}
                <ElegantHeader 
                    icon={Package}
                    sectionName="Gestión de Inventario"
                    title="Invenatario de "
                    highlightText="Insumos Médicos"
                    description="Administra tu catálogo, monitorea existencias y gestiona el flujo de materiales con precisión."
                >
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 lg:mt-0 w-full lg:w-auto">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-3 text-gray-500 mb-2">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                    <Box size={18} />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wider">Total Items</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{totalItems}</span>
                        </div>

                        <div className={`bg-white p-4 rounded-2xl border shadow-sm flex flex-col justify-between group transition-all ${lowCount > 0 ? 'border-red-100 hover:border-red-200' : 'border-gray-100 hover:border-indigo-200'}`}>
                            <div className="flex items-center gap-3 text-gray-500 mb-2">
                                <div className={`p-2 rounded-lg transition-colors ${lowCount > 0 ? 'bg-red-50 text-red-600 group-hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
                                    <TrendingDown size={18} />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wider">Bajo Stock</span>
                            </div>
                            <span className={`text-2xl font-bold ${lowCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{lowCount}</span>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-all md:flex">
                            <div className="flex items-center gap-3 text-gray-500 mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <DollarSign size={18} />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wider">Valor Total</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </ElegantHeader>

                {/* Toolbar & Filters Section */}
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
                                {(filters.name || filters.code || filters.brand_id || filters.status || filters.min_price || filters.max_price) && (
                                    <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                )}
                            </button>

                            <button 
                                onClick={() => setLowStockOnly(!lowStockOnly)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                                    lowStockOnly 
                                    ? 'bg-red-50 text-red-700 border-red-200 shadow-sm' 
                                    : 'bg-white text-gray-600 border-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                                }`}
                            >
                                <AlertTriangle size={18} className={lowStockOnly ? 'fill-current animate-pulse' : ''} />
                                <span className="hidden sm:inline">Bajo Stock</span>
                            </button>

                            <div className="h-6 w-px bg-gray-200 hidden sm:block mx-1"></div>

                            {canEdit && (
                                <>
                                    <button 
                                        onClick={() => setShowBrandModal(true)}
                                        className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 border border-transparent hover:border-indigo-100 hover:shadow-sm"
                                        title="Gestionar Marcas"
                                    >
                                        <Tag size={20} />
                                    </button>

                                    <button 
                                        onClick={handleShowAlerts}
                                        className="p-2.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-300 border border-transparent hover:border-amber-100 hover:shadow-sm"
                                        title="Alertas de Vencimiento"
                                    >
                                        <AlertTriangle size={20} />
                                    </button>
                                </>
                            )}

                            <button 
                                onClick={exportCSV}
                                disabled={exporting}
                                className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-300 border border-transparent hover:border-emerald-100 hover:shadow-sm"
                                title="Exportar CSV"
                            >
                                <Download size={20} />
                            </button>

                            {canEdit && (
                                <button
                                    onClick={() => setCreating(true)}
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

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-[100vw]">
                    <InventoryTable
                        items={items}
                        loading={loading}
                        onEdit={setEditingItem}
                        onDelete={handleDelete}
                        onRestock={setRestockItem}
                        onManageBatches={setBatchItem}
                        onMovements={openMovements}
                        canEdit={canEdit}
                    />
                </div>
            </div>

            {/* Modals */}
            <Modal open={creating} title="Registrar Nuevo Insumo" onClose={() => setCreating(false)} maxWidth="max-w-md lg:max-w-xl">
                <ItemForm loading={false} onSubmit={handleCreate} />
            </Modal>
            <Modal open={!!editingItem} title={`Editar: ${editingItem?.name || ''}`} onClose={() => setEditingItem(null)} maxWidth="max-w-md lg:max-w-xl">
                {editingItem && <ItemForm initial={editingItem} loading={false} onSubmit={handleUpdate} />}
            </Modal>
            <Modal open={!!restockItem} title={`Abastecer: ${restockItem?.name || ''}`} onClose={() => setRestockItem(null)} maxWidth="max-w-sm md:max-w-md">
                {restockItem && <RestockForm item={restockItem} loading={false} onSubmit={handleRestock} />}
            </Modal>

            <MovementsDrawer
                isOpen={!!movementsItem}
                item={movementsItem}
                movements={movements}
                loading={loadingMovements}
                onClose={() => { setMovementsItem(null); setMovements([]); }}
            />

            <ExpiringModal
                isOpen={showExpiringModal}
                onClose={() => setShowExpiringModal(false)}
                items={expiringItems}
                loading={loadingExpiring}
            />

            {batchItem && (
                <BatchManagementModal
                    item={batchItem}
                    onClose={() => setBatchItem(null)}
                    onUpdate={fetchInventory}
                />
            )}

            {showBrandModal && (
                <BrandManagementModal onClose={() => setShowBrandModal(false)} />
            )}
        </div>
    );
}