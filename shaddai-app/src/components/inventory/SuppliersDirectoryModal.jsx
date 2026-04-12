import React, { useState } from 'react';
import { Building2, Pencil, Plus, Search, Activity, Mail, Phone, Hash, X } from 'lucide-react';

export default function SuppliersDirectoryModal({
  open,
  onClose,
  suppliers = [],
  loading = false,
  canCreate = false,
  canEdit = false,
  onOpenCreateSupplier,
  onEditSupplier
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!open) return null;

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.contact_name && s.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.tax_id && s.tax_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={(e) => { e.stopPropagation(); onClose(); }} />
      
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Dinámico */}
        <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-start z-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Building2 size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                Directorio de Proveedores
              </h2>
            </div>
            <p className="text-sm text-gray-500 ml-11">
              Consulta la lista completa de proveedores registrados en el sistema.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {canCreate && (
                 <button 
                  onClick={onOpenCreateSupplier}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Nuevo Proveedor</span>
                </button>
             )}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Header Toolbar (Search) */}
        <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Buscar proveedor por nombre, contacto o RIF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
            </div>
            <div className="flex-shrink-0 text-sm font-medium text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              Total: {suppliers.length}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Cargando proveedores...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-white max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg">No se encontraron proveedores</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                {searchTerm ? 'Intenta ajustando los términos de búsqueda.' : 'Aún no has registrado ningún proveedor.'}
              </p>
              {!searchTerm && canCreate && (
                <button 
                    onClick={onOpenCreateSupplier}
                    className="mt-6 px-5 py-2.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center gap-2"
                >
                    <Plus size={18} /> Registrar Primer Proveedor
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSuppliers.map((supplier) => (
                <div 
                    key={supplier.id} 
                    className={`group bg-white border rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative flex flex-col h-full ${
                        Number(supplier.is_active) === 1 ? 'border-gray-200 hover:border-indigo-300' : 'border-gray-200 bg-gray-50/50 opacity-80 hover:opacity-100'
                    }`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-base leading-tight mb-1 pr-2">{supplier.name}</h4>
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                                Number(supplier.is_active) === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                            }`}>
                                {Number(supplier.is_active) === 1 ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        {canEdit && (
                            <button 
                                onClick={() => onEditSupplier?.(supplier)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0"
                                title="Editar proveedor"
                            >
                                <Pencil size={18} />
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Hash size={14} className="text-gray-400" />
                            <span className="font-medium">{supplier.tax_id || <span className="text-gray-400 italic">Sin RIF/NIT</span>}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} className="text-gray-400" />
                            <span className="truncate">{supplier.phone || <span className="text-gray-400 italic">Sin teléfono</span>}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} className="text-gray-400" />
                            <span className="truncate" title={supplier.email}>{supplier.email || <span className="text-gray-400 italic">Sin correo</span>}</span>
                        </div>
                        {supplier.contact_name && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Contacto Principal</p>
                                <p className="text-sm font-medium text-gray-800">{supplier.contact_name}</p>
                            </div>
                        )}
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
