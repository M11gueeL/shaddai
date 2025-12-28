import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { listInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, restockInventoryItem, listInventoryMovements, getExpiringItems } from '../../api/inventoryApi';
import { Package } from 'lucide-react';
import InventoryActions from './InventoryActions';
import InventoryTable from './InventoryTable';
import Modal from './Modal';
import ItemForm from './ItemForm';
import RestockForm from './RestockForm';
import MovementsDrawer from './MovementsDrawer';
import ExpiringModal from './ExpiringModal';
import BatchManagementModal from './BatchManagementModal';
import BrandManagementModal from './BrandManagementModal';
import ElegantHeader from '../common/ElegantHeader';

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

    const fetchInventory = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = { all: 1, low_stock: lowStockOnly ? 1 : undefined, search: search || undefined };
            const res = await listInventory(params, token);
            setItems(res.data || []);
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error cargando inventario');
        } finally {
            setLoading(false);
        }
    }, [token, lowStockOnly, search, toast]);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    const handleCreate = async (data) => {
        try {
            const res = await createInventoryItem(data, token);
            if (res.data.message) {
                toast.info(res.data.message);
                return;
            }
            toast.success('Insumo creado');
            setCreating(false);
            fetchInventory();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error creando');
        }
    };

    const handleUpdate = async (data) => {
        try {
            const res = await updateInventoryItem(editingItem.id, data, token);
            if (res.data.message) {
                toast.info(res.data.message);
                return;
            }
            toast.success('Actualizado');
            setEditingItem(null);
            fetchInventory();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error actualizando');
        }
    };

    const handleDelete = async (item) => {
        const accepted = await confirm({
            title: `Eliminar ${item.name}`,
            message: 'Esta acción solo desactiva el insumo, pero impacta los procesos que lo usan. ¿Deseas continuar?',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            tone: 'danger'
        });
        if (!accepted) return;
        try {
            await deleteInventoryItem(item.id, token);
            toast.success('Borrado lógico');
            fetchInventory();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error borrando');
        }
    };

    const handleRestock = async (formData) => {
        try {
            const res = await restockInventoryItem(restockItem.id, formData, token);
            if (res.data.message) {
                toast.info(res.data.message);
                return;
            }
            toast.success('Stock actualizado');
            setRestockItem(null);
            fetchInventory();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error abasteciendo');
        }
    };

    const openMovements = async (item) => {
        setMovementsItem(item);
        setLoadingMovements(true);
        try {
            const res = await listInventoryMovements(item.id, { limit: 100 }, token);
            setMovements(res.data || []);
        } catch (e) {
            toast.error('Error cargando movimientos');
        } finally {
            setLoadingMovements(false);
        }
    };

    const exportCSV = () => {
        setExporting(true);
        try {
            const header = ['id','code','name','stock','unit','reorder','price_usd','active'];
            const rows = items.map(i => [i.id, i.code || '', '"'+i.name+'"', i.stock_quantity, i.unit_of_measure, i.reorder_level, i.price_usd, i.is_active]);
            const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'inventario.csv';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Exportado inventario.csv');
        } catch (e) {
            toast.error('Error exportando');
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
            toast.error('Error cargando alertas');
        } finally {
            setLoadingExpiring(false);
        }
    };

    const totalItems = items.length;
    const lowCount = useMemo(() => items.filter(i => i.stock_quantity <= i.reorder_level).length, [items]);

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 overflow-x-hidden">
            {/* Header */}
            <ElegantHeader 
                icon={Package}
                sectionName="Inventario"
                title="Control de"
                highlightText="Insumos"
                description="Gestiona insumos, controla stock, abastece y consulta historial de movimientos fácilmente."
            >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
                    <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-start rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3 min-w-[120px]">
                        <span className="text-indigo-600 font-semibold">Insumos</span><span className="text-2xl font-bold text-indigo-900">{totalItems}</span>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-start rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3 min-w-[120px]">
                        <span className="text-indigo-600 font-semibold">Bajo stock</span><span className="text-2xl font-bold text-indigo-900">{lowCount}</span>
                    </div>
                </div>
            </ElegantHeader>

            <InventoryActions
                onSearch={setSearch}
                search={search}
                onToggleLowStock={() => setLowStockOnly(s => !s)}
                lowStockOnly={lowStockOnly}
                onCreateClick={() => setCreating(true)}
                onRefresh={fetchInventory}
                canEdit={canEdit}
                exporting={exporting}
                onExport={exportCSV}
                onShowAlerts={handleShowAlerts}
                onManageBrands={() => setShowBrandModal(true)}
            />

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

            {/* Modals */}
            <Modal open={creating} title="Nuevo Insumo" onClose={() => setCreating(false)} maxWidth="max-w-md lg:max-w-xl">
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