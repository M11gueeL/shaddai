import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { listInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, registerInternalConsumption, listInventoryMovements, getExpiringItems, getBrands, getInventoryStats, getSuppliers, createSupplier as createSupplierApi, updateSupplier as updateSupplierApi, storePurchase, getPurchases, getPurchaseDetails } from '../../api/inventoryApi';
import { Package } from 'lucide-react';
import InventoryTable from './InventoryTable';
import Modal from './Modal';
import ItemForm from './ItemForm';
import InternalConsumptionForm from './InternalConsumptionForm';
import MovementsDrawer from './MovementsDrawer';
import ExpiringModal from './ExpiringModal';
import BatchManagementModal from './BatchManagementModal';
import BrandManagementModal from './BrandManagementModal';
import ElegantHeader from '../common/ElegantHeader';
import InventoryStats from './InventoryStats';
import InventoryFilters from './InventoryFilters';
import InventoryActionToolbar from './InventoryActionToolbar';
import InventoryReportsModal from './InventoryReportsModal';
import PurchaseRestockModal from './PurchaseRestockModal';
import PurchasesRecentModal from './PurchasesRecentModal';
import SuppliersDirectoryModal from './SuppliersDirectoryModal';
import NewSupplierModal from './NewSupplierModal';
import EditSupplierModal from './EditSupplierModal';

export default function InventoryPanel() {
    const { token, hasRole } = useAuth();
    const toast = useToast();
    const { confirm } = useConfirm();
    const canEdit = hasRole(['admin']);
    const canPurchase = hasRole(['admin', 'farmacia']);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [creating, setCreating] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [consumptionItem, setConsumptionItem] = useState(null);
    const [movementsItem, setMovementsItem] = useState(null);
    const [movements, setMovements] = useState([]);
    const [loadingMovements, setLoadingMovements] = useState(false);
    const [showExpiringModal, setShowExpiringModal] = useState(false);
    const [expiringItems, setExpiringItems] = useState([]);
    const [loadingExpiring, setLoadingExpiring] = useState(false);
    const [batchItem, setBatchItem] = useState(null);
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showPurchasesModal, setShowPurchasesModal] = useState(false);
    const [showSuppliersModal, setShowSuppliersModal] = useState(false);
    const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
    const [selectedPurchaseDetails, setSelectedPurchaseDetails] = useState(null);
    const [loadingPurchaseDetails, setLoadingPurchaseDetails] = useState(false);
    const [submittingPurchase, setSubmittingPurchase] = useState(false);
    const [creatingSupplier, setCreatingSupplier] = useState(false);
    const [loadingPurchases, setLoadingPurchases] = useState(false);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);
    const [updatingSupplier, setUpdatingSupplier] = useState(false);
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

    const fetchSuppliers = useCallback(async (params = {}) => {
        if (!token) return;
        try {
            setLoadingSuppliers(true);
            const res = await getSuppliers(params);
            const payload = res.data?.data || res.data || [];
            setSuppliers(Array.isArray(payload) ? payload : []);
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error cargando proveedores');
        } finally {
            setLoadingSuppliers(false);
        }
    }, [token, toast]);

    const fetchRecentPurchases = useCallback(async () => {
        if (!token) return;
        try {
            setLoadingPurchases(true);
            const purchasesRes = await getPurchases({ limit: 80 });

            const purchasePayload = purchasesRes.data?.data || purchasesRes.data || [];

            setPurchases(Array.isArray(purchasePayload) ? purchasePayload : []);
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error cargando compras');
        } finally {
            setLoadingPurchases(false);
        }
    }, [token, toast]);

    useEffect(() => {
        if (showPurchaseModal) {
            fetchSuppliers();
        }
    }, [showPurchaseModal, fetchSuppliers]);

    useEffect(() => {
        if (showPurchasesModal) {
            fetchRecentPurchases();
            setSelectedPurchaseId(null);
            setSelectedPurchaseDetails(null);
        }
    }, [showPurchasesModal, fetchRecentPurchases]);

    const handleViewPurchaseDetails = async (purchase) => {
        const purchaseId = Number(purchase?.id || 0);
        if (!purchaseId) return;

        if (selectedPurchaseId === purchaseId) {
            setSelectedPurchaseId(null);
            setSelectedPurchaseDetails(null);
            return;
        }

        try {
            setLoadingPurchaseDetails(true);
            setSelectedPurchaseId(purchaseId);
            const res = await getPurchaseDetails(purchaseId);
            const payload = res.data?.data || null;
            setSelectedPurchaseDetails(payload);
        } catch (e) {
            setSelectedPurchaseId(null);
            setSelectedPurchaseDetails(null);
            toast.error(e.response?.data?.error || 'No se pudo cargar el detalle de la compra');
        } finally {
            setLoadingPurchaseDetails(false);
        }
    };

    useEffect(() => {
        if (showSuppliersModal) {
            fetchSuppliers({ all: 1 });
        }
    }, [showSuppliersModal, fetchSuppliers]);

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

    const handleInternalConsumption = async (formData) => {
        try {
            const res = await registerInternalConsumption(formData, token);
            if (res.data.message) {
                toast.success(res.data.message);
            }
            setConsumptionItem(null);
            fetchInventory();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error registrando consumo interno');
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

    const handleCreateSupplierQuick = async (supplierData) => {
        try {
            setCreatingSupplier(true);
            const res = await createSupplierApi(supplierData, token);
            const supplierId = res.data?.supplier_id || res.data?.id;

            const newSupplier = {
                id: supplierId,
                name: supplierData.name,
                tax_id: supplierData.tax_id || null,
                phone: supplierData.phone || null,
                email: supplierData.email || null,
                address: supplierData.address || null,
            };

            if (supplierId) {
                setSuppliers((prev) => {
                    const exists = prev.some((s) => String(s.id) === String(supplierId));
                    return exists ? prev : [...prev, newSupplier].sort((a, b) => String(a.name).localeCompare(String(b.name)));
                });
            }

            toast.success('Proveedor creado correctamente');
            return newSupplier;
        } catch (e) {
            toast.error(e.response?.data?.error || 'No se pudo crear el proveedor');
            return null;
        } finally {
            setCreatingSupplier(false);
        }
    };

    const handleStorePurchase = async (purchaseData) => {
        try {
            setSubmittingPurchase(true);
            await storePurchase(purchaseData, token);
            toast.success('Abastecimiento registrado correctamente');
            setShowPurchaseModal(false);
            fetchRecentPurchases();
            fetchInventory();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error procesando compra');
        } finally {
            setSubmittingPurchase(false);
        }
    };

    const handleSupplierCreatedFromDirectory = (supplier) => {
        if (!supplier?.id) return;

        setSuppliers((prev) => {
            const exists = prev.some((s) => String(s.id) === String(supplier.id));
            if (exists) return prev;
            return [...prev, supplier].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        });

        toast.success('Proveedor creado correctamente');
    };

    const handleSupplierUpdated = async (supplierData) => {
        if (!editingSupplier?.id) return;

        try {
            setUpdatingSupplier(true);
            await updateSupplierApi(editingSupplier.id, supplierData);

            setSuppliers((prev) => prev.map((s) => {
                if (String(s.id) !== String(editingSupplier.id)) return s;
                return {
                    ...s,
                    ...supplierData,
                    id: s.id
                };
            }));

            toast.success('Proveedor actualizado correctamente');
            setEditingSupplier(null);
            setShowSuppliersModal(true);
        } catch (e) {
            toast.error(e.response?.data?.error || 'No se pudo actualizar el proveedor');
        } finally {
            setUpdatingSupplier(false);
        }
    };

    return (
        <div className="min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
                
                {/* Header Section */}
                <ElegantHeader 
                    icon={Package}
                    sectionName="Gestión de Inventario"
                    title="Inventario de "
                    highlightText="Insumos Médicos"
                    description="Administra tu catálogo, monitorea existencias y gestiona el flujo de materiales con precisión."
                >
                    <InventoryStats stats={stats} />
                </ElegantHeader>

                {/* Actions Section (separated for cleaner UX) */}
                <InventoryActionToolbar
                    canEdit={canEdit}
                    canPurchase={canPurchase}
                    onShowBrandModal={() => setShowBrandModal(true)}
                    onShowAlerts={handleShowAlerts}
                    onOpenReports={() => setShowReportsModal(true)}
                    onOpenPurchases={() => setShowPurchasesModal(true)}
                    onOpenSuppliers={() => setShowSuppliersModal(true)}
                    onOpenPurchase={() => setShowPurchaseModal(true)}
                    onCreate={() => setCreating(true)}
                />

                {/* Search + Filters + Table Section (unified block) */}
                <div className="rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full bg-white">
                    <div className="border-b border-gray-100 bg-gray-50/50 px-2 py-1">
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
                        />
                    </div>

                    <InventoryTable
                        items={items}
                        loading={loading}
                        onEdit={setEditingItem}
                        onDelete={handleDelete}
                        onInternalConsumption={setConsumptionItem}
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
            <Modal open={!!consumptionItem} title={`Uso Interno: ${consumptionItem?.name || ''}`} onClose={() => setConsumptionItem(null)} maxWidth="max-w-sm md:max-w-md">
                {consumptionItem && <InternalConsumptionForm item={consumptionItem} loading={false} onSubmit={handleInternalConsumption} />}
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

            <InventoryReportsModal 
                isOpen={showReportsModal} 
                onClose={() => setShowReportsModal(false)} 
            />

            <PurchasesRecentModal
                open={showPurchasesModal}
                onClose={() => setShowPurchasesModal(false)}
                purchases={purchases}
                loading={loadingPurchases}
                selectedPurchaseId={selectedPurchaseId}
                selectedPurchaseDetails={selectedPurchaseDetails}
                loadingDetails={loadingPurchaseDetails}
                onSelectPurchase={handleViewPurchaseDetails}
                canPurchase={canPurchase}
                onOpenPurchase={() => {
                    setShowPurchasesModal(false);
                    setShowPurchaseModal(true);
                }}
            />

            <SuppliersDirectoryModal
                open={showSuppliersModal}
                onClose={() => setShowSuppliersModal(false)}
                suppliers={suppliers}
                loading={loadingSuppliers}
                canCreate={canEdit}
                canEdit={canEdit}
                onOpenCreateSupplier={() => {
                    setShowSuppliersModal(false);
                    setShowNewSupplierModal(true);
                }}
                onEditSupplier={(supplier) => {
                    setShowSuppliersModal(false);
                    setEditingSupplier(supplier);
                }}
            />

            <NewSupplierModal
                open={showNewSupplierModal}
                onClose={() => setShowNewSupplierModal(false)}
                onSuccess={(supplier) => {
                    handleSupplierCreatedFromDirectory(supplier);
                    fetchSuppliers({ all: 1 });
                    setShowNewSupplierModal(false);
                    setShowSuppliersModal(true);
                }}
            />

            <EditSupplierModal
                open={!!editingSupplier}
                supplier={editingSupplier}
                loading={updatingSupplier}
                onClose={() => {
                    setEditingSupplier(null);
                    setShowSuppliersModal(true);
                }}
                onSave={handleSupplierUpdated}
            />

            <PurchaseRestockModal
                open={showPurchaseModal}
                onClose={() => setShowPurchaseModal(false)}
                products={items}
                suppliers={suppliers}
                onSubmit={handleStorePurchase}
                onCreateSupplier={handleCreateSupplierQuick}
                submitting={submittingPurchase}
                creatingSupplier={creatingSupplier}
            />
        </div>
    );
}
