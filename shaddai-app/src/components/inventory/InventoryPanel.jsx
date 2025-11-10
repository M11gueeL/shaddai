/*
                    <input name="price_usd" type="number" step="0.01" value={form.price_usd} onChange={handleChange} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600">Unidad</label>
                    <input name="unit_of_measure" value={form.unit_of_measure} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600">Nivel Reorden</label>
                    <input name="reorder_level" type="number" value={form.reorder_level} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600">Stock Inicial</label>
                    <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600">Descripción</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex items-center gap-2">
                    <input id="is_active" type="checkbox" name="is_active" checked={form.is_active === 1} onChange={handleChange} className="rounded" />
                    <label htmlFor="is_active" className="text-xs font-semibold text-gray-600">Activo</label>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
                </button>
            </div>
        </form>
    );
}

// Modal Restock
function RestockForm({ item, onSubmit, loading }) {
    const [quantity, setQuantity] = useState(0);
    const [notes, setNotes] = useState('');
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ quantity, notes }); }} className="space-y-5">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-800">
                Stock actual: <strong>{item.stock_quantity}</strong>
            </div>
            <div>
                <label className="text-xs font-semibold text-gray-600">Cantidad a agregar *</label>
                <input type="number" min={1} required value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value || '0'))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
                <label className="text-xs font-semibold text-gray-600">Notas</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />} Abastecer
                </button>
            </div>
        </form>
    );
}

// Movimientos Drawer
function MovementsDrawer({ open, item, movements, loading, onClose }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-40 flex">
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-gray-200 flex flex-col animate-slide-in-right">
                <div className="p-5 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Movimientos: {item?.name}</h3>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>}
                    {!loading && !movements.length && <p className="text-sm text-gray-500">Sin movimientos recientes.</p>}
                    {movements.map(m => (
                        <div key={m.id} className="rounded-lg border border-gray-200 p-3 flex items-center gap-3 bg-gray-50">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border">
                                {m.movement_type === 'in_restock' ? <ArrowUpCircle className="w-5 h-5 text-emerald-600" /> : <ArrowDownCircle className="w-5 h-5 text-red-600" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-700">{m.movement_type}</p>
                                <p className="text-xs text-gray-500">Cantidad: {m.quantity}</p>
                                {m.notes && <p className="text-[11px] text-gray-400 mt-0.5">{m.notes}</p>}
                            </div>
                            <span className="text-[11px] text-gray-400">{new Date(m.created_at).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

*/
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { listInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, restockInventoryItem, listInventoryMovements } from '../../api/inventoryApi';
import { Package } from 'lucide-react';
import InventoryActions from './InventoryActions';
import InventoryTable from './InventoryTable';
import Modal from './Modal';
import ItemForm from './ItemForm';
import RestockForm from './RestockForm';
import MovementsDrawer from './MovementsDrawer';

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
            toast.success('Insumo creado');
            setCreating(false);
            fetchInventory();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error creando');
        }
    };

    const handleUpdate = async (data) => {
        try {
            await updateInventoryItem(editingItem.id, data, token);
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

    const handleRestock = async ({ quantity, notes }) => {
        try {
            await restockInventoryItem(restockItem.id, { quantity, notes }, token);
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

    const totalItems = items.length;
    const lowCount = useMemo(() => items.filter(i => i.stock_quantity <= i.reorder_level).length, [items]);

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 text-white p-6 sm:p-8 shadow-lg">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent)]" />
                <div className="relative">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-3">
                        <Package className="w-7 h-7 sm:w-8 sm:h-8" /> Inventario de Insumos Médicos
                    </h1>
                    <p className="text-sm mt-2 text-indigo-100/90 max-w-2xl">Gestiona insumos. Controla stock, abastece y consulta historial de movimientos fácilmente.</p>
                    <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
                        <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-start rounded-2xl bg-white/10 px-4 py-3">
                            <span className="text-indigo-100">Insumos</span><span className="text-lg font-semibold">{totalItems}</span>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-start rounded-2xl bg-white/10 px-4 py-3">
                            <span className="text-indigo-100">Bajo stock</span><span className="text-lg font-semibold">{lowCount}</span>
                        </div>
                    </div>
                </div>
            </div>

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
            />

            <InventoryTable
                items={items}
                loading={loading}
                onEdit={setEditingItem}
                onDelete={handleDelete}
                onRestock={setRestockItem}
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
                open={!!movementsItem}
                item={movementsItem}
                movements={movements}
                loading={loadingMovements}
                onClose={() => { setMovementsItem(null); setMovements([]); }}
            />
        </div>
    );
}

// Animations (utility CSS via tailwind directives - ensure they exist or fallback) could be added in global CSS.