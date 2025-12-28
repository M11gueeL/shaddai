import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { listInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, restockInventoryItem, listInventoryMovements, getExpiringItems, getBrands, getInventoryStats } from '../../api/inventoryApi';
import { Package } from 'lucide-react';
import InventoryTable from './InventoryTable';
import Modal from './Modal';
import ItemForm from './ItemForm';
import RestockForm from './RestockForm';
import MovementsDrawer from './MovementsDrawer';
import ExpiringModal from './ExpiringModal';
import BatchManagementModal from './BatchManagementModal';
import BrandManagementModal from './BrandManagementModal';
import ElegantHeader from '../common/ElegantHeader';
import InventoryStats from './InventoryStats';
import InventoryFilters from './InventoryFilters';

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
    const [stats, setStats] = useState({ total_items: 0, low_stock_count: 0, total_value: 0 });

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
            getBrands({}, token).then(res => setBrands(res.data || [])).catch(console.error);
        }
    }, [token]);

    // Auto-refresh interval (every 5 seconds)
    useEffect(() => {
        if (!token) return;
        const interval = setInterval(() => {
            const params = { 
                all: 1, 
                low_stock: lowStockOnly ? 1 : undefined, 
                search: search || undefined,
                ...filters
            };
            listInventory(params, token).then(res => {
                if (Array.isArray(res.data)) setItems(res.data);
            }).catch(console.error);
            
            getInventoryStats(token).then(res => {
                if (res.data) setStats(res.data);
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
            const [resItems, resStats] = await Promise.all([
                listInventory(params, token),
                getInventoryStats(token)
            ]);
            
            setItems(Array.isArray(resItems.data) ? resItems.data : []);
            setStats(resStats.data || { total_items: 0, low_stock_count: 0, total_value: 0 });
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
                    <InventoryStats stats={stats} />
                </ElegantHeader>

                {/* Toolbar & Filters Section */}
                <InventoryFilters
                    search={search}
                    setSearch={setSearch}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    lowStockOnly={lowStockOnly}
                    setLowStockOnly={setLowStockOnly}
                    filters={filters}
                    setFilters={setFilters}
                    brands={brands}
                    canEdit={canEdit}
                    onShowBrandModal={() => setShowBrandModal(true)}
                    onShowAlerts={handleShowAlerts}
                    exporting={exporting}
                    onExportCSV={exportCSV}
                    onCreate={() => setCreating(true)}
                />

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-[100vw]">
                    <InventoryTable
                        items={items}
                        loading={loading}
                        onEdit={setEditingItem}
                        onDelete={handleDelete}
                        onRestock={setRestockItem}
                        onMovements={openMovements}
                        onManageBatches={setBatchItem}
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
