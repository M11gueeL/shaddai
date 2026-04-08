import React from 'react';
import { Bookmark, Bell, FileText, ClipboardList, Building2, Plus, Truck } from 'lucide-react';

export default function InventoryActionToolbar({
  canEdit,
  canPurchase,
  onShowBrandModal,
  onShowAlerts,
  onOpenReports,
  onOpenPurchases,
  onOpenSuppliers,
  onOpenPurchase,
  onCreate
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {canEdit && (
          <>
            <button
              onClick={onShowBrandModal}
              className="group flex items-center gap-2.5 px-4 py-2.5 bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50 hover:text-indigo-700 hover:border-indigo-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              title="Gestionar Marcas"
            >
              <Bookmark size={18} className="transition-transform duration-300 group-hover:rotate-[-8deg]" />
              <span className="font-semibold tracking-tight">Marcas</span>
            </button>

            <button
              onClick={onShowAlerts}
              className="group flex items-center gap-2.5 px-4 py-2.5 bg-white text-slate-600 border border-slate-200/70 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              title="Alertas de Vencimiento"
            >
              <Bell size={18} className="transition-transform duration-300 group-hover:rotate-[8deg]" />
              <span className="font-semibold tracking-tight">Alertas</span>
            </button>
          </>
        )}

        <button
          onClick={onOpenReports}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-white text-slate-600 border border-slate-200/70 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          title="Reportes y Analisis"
        >
          <FileText size={18} className="transition-transform duration-300 group-hover:scale-110" />
          <span className="font-semibold tracking-tight">Reportes</span>
        </button>

        {canPurchase && (
          <button
            onClick={onOpenPurchases}
            className="group flex items-center gap-2.5 px-4 py-2.5 bg-white text-slate-600 border border-slate-200/70 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            title="Compras recientes"
          >
            <ClipboardList size={18} className="transition-transform duration-300 group-hover:scale-110" />
            <span className="font-semibold tracking-tight">Compras</span>
          </button>
        )}

        {canPurchase && (
          <button
            onClick={onOpenSuppliers}
            className="group flex items-center gap-2.5 px-4 py-2.5 bg-white text-slate-600 border border-slate-200/70 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            title="Directorio de proveedores"
          >
            <Building2 size={18} className="transition-transform duration-300 group-hover:scale-110" />
            <span className="font-semibold tracking-tight">Proveedores</span>
          </button>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {canPurchase && (
            <button
              onClick={onOpenPurchase}
              className="group relative overflow-hidden flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-600 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 font-semibold text-sm"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
              <Truck size={18} className="relative" />
              <span className="hidden sm:inline">Registrar Abastecimiento</span>
              <span className="sm:hidden">Abastecer</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={onCreate}
              className="group relative overflow-hidden flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 font-semibold text-sm"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
              <Plus size={20} className="relative transition-transform duration-300 group-hover:rotate-90" />
              <span className="hidden sm:inline">Nuevo Producto</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
