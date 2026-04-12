import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Save, Loader2, Tag, ChevronLeft, Building2, AlertTriangle, Search, Activity } from 'lucide-react';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../api/inventoryApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export default function BrandManagementModal({ isOpen = true, onClose }) {
  const { token } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchBrands();
      setView('list');
      setSearchTerm('');
    }
  }, [token, isOpen]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await getBrands({}, token);
      setBrands(res.data || []);
    } catch (error) {
      toast.error("Error cargando marcas");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (brand = null) => {
    if (brand) {
      setEditingId(brand.id);
      setFormData({ name: brand.name, description: brand.description || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '' });
    }
    setView('form');
  };

  const handleCloseForm = () => {
    setView('list');
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await updateBrand(editingId, formData, token);
        toast.success("Marca actualizada exitosamente");
      } else {
        await createBrand(formData, token);
        toast.success("Marca registrada exitosamente");
      }
      fetchBrands();
      handleCloseForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al procesar la marca");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (brand) => {
    const isDeactivating = brand.is_active;
    const actionText = isDeactivating ? 'desactivar' : 'activar';
    
    const isConfirmed = await confirm({
      title: `${isDeactivating ? 'Desactivar' : 'Activar'} Marca`,
      message: `¿Estás seguro que deseas ${actionText} la marca "${brand.name}"? ${isDeactivating ? 'No aparecerá en los selectores de nuevos ingresos.' : ''}`,
      confirmText: `Sí, ${actionText}`,
      tone: isDeactivating ? 'danger' : 'primary'
    });

    if (!isConfirmed) return;

    try {
        if(isDeactivating){
            await deleteBrand(brand.id, token);
        } else {
            // Asumiendo que el updateBrand permite actualizar el estado is_active o hay un endpoint específico
            await updateBrand(brand.id, { is_active: true }, token);
        }
      toast.success(`Marca ${isDeactivating ? 'desactivada' : 'activada'} correctamente`);
      fetchBrands();
    } catch (error) {
      toast.error(`Error al ${actionText} la marca`);
    }
  };

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={(e) => { e.stopPropagation(); onClose(); }} />
      
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Dinámico */}
        <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-start z-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {view === 'form' ? (
                <button 
                  onClick={handleCloseForm}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors mr-1"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Tag size={20} />
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {view === 'form' ? (editingId ? 'Editar Marca' : 'Nueva Marca') : 'Marcas y Laboratorios'}
              </h2>
            </div>
            {view === 'list' && (
              <p className="text-sm text-gray-500 ml-11">
                Gestiona los fabricantes o laboratorios de tus insumos.
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             {view === 'list' && (
                 <button 
                  onClick={() => handleOpenForm()}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Registrar</span>
                </button>
             )}
             <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Header Toolbar (Search) - Only in List View */}
        {view === 'list' && (
            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar marca por nombre o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
          {view === 'list' ? (
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 font-medium">Cargando marcas...</p>
                </div>
              ) : filteredBrands.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-semibold text-lg">No se encontraron marcas</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                    {searchTerm ? 'Intenta ajustando los términos de búsqueda.' : 'Aún no has registrado ninguna marca. Comienza registrando la primera.'}
                  </p>
                  {!searchTerm && (
                    <button 
                        onClick={() => handleOpenForm()}
                        className="mt-6 px-5 py-2.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center gap-2"
                    >
                        <Plus size={18} /> Registrar Primera Marca
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBrands.map(brand => (
                    <div 
                        key={brand.id} 
                        className={`group bg-white border rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden ${
                            brand.is_active ? 'border-gray-200 hover:border-indigo-300' : 'border-red-100 bg-red-50/30'
                        }`}
                    >
                        {!brand.is_active && (
                            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                <div className="absolute top-4 -right-6 px-6 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider transform rotate-45">
                                    Inactivo
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-3 pr-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${brand.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-red-100 text-red-500'}`}>
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base line-clamp-1">{brand.name}</h4>
                                    <p className="text-xs text-gray-500 font-medium">ID: {brand.id.toString().padStart(4, '0')}</p>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2 h-10 mb-5">
                            {brand.description || <span className="italic text-gray-400">Sin descripción adicional</span>}
                        </p>
                        
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                            <button 
                                onClick={() => handleOpenForm(brand)} 
                                className="flex-1 py-2 px-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-indigo-600 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit2 size={16}/> Editar
                            </button>
                            <button 
                                onClick={() => handleToggleStatus(brand)} 
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${
                                    brand.is_active 
                                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                                        : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                }`}
                            >
                                <Activity size={16}/>
                                {brand.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 max-w-2xl mx-auto animate-in slide-in-from-right-8 duration-300">
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        Nombre de la Marca u Laboratorio <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ej. La Santé, Bayer..." 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 text-sm transition-all px-4 bg-gray-50 focus:bg-white"
                      required
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2">Este nombre aparecerá en las opciones al registrar nuevos insumos.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Descripción <span className="text-gray-400 font-normal">(Opcional)</span>
                    </label>
                    <textarea 
                      placeholder="Detalles adicionales, líneas de productos que maneja..." 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 text-sm transition-all px-4 bg-gray-50 focus:bg-white resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={handleCloseForm} 
                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                    {editingId ? 'Guardar Cambios' : 'Registrar Marca'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
