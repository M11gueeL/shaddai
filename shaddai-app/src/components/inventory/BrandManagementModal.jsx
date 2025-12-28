import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save, Loader2, Tag } from 'lucide-react';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../api/inventoryApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export default function BrandManagementModal({ onClose }) {
  const { token } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, [token]);

  const fetchBrands = async () => {
    try {
      const res = await getBrands({}, token);
      setBrands(res.data || []);
    } catch (error) {
      toast.error("Error cargando marcas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await updateBrand(editingId, formData, token);
        toast.success("Marca actualizada");
      } else {
        await createBrand(formData, token);
        toast.success("Marca creada");
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      fetchBrands();
    } catch (error) {
      toast.error("Error guardando marca");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingId(brand.id);
    setFormData({ name: brand.name, description: brand.description || '' });
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Desactivar Marca',
      message: '¿Seguro que deseas desactivar esta marca?',
      confirmText: 'Sí, desactivar',
      tone: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await deleteBrand(id, token);
      toast.success("Marca desactivada");
      fetchBrands();
    } catch (error) {
      toast.error("Error eliminando marca");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Tag className="text-indigo-600" /> Gestión de Marcas / Laboratorios
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              {editingId ? <Edit2 size={18} className="text-indigo-600"/> : <Plus size={18} className="text-indigo-600"/>}
              {editingId ? 'Editar Marca' : 'Registrar Nueva Marca'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre de la Marca *</label>
                <input 
                  type="text" 
                  placeholder="Ej. La Santé" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Breve descripción..." 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-sm transition-all px-4"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-2 border-t border-gray-50">
              {editingId && (
                <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  Cancelar
                </button>
              )}
              <button 
                type="submit" 
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                {editingId ? 'Actualizar Marca' : 'Guardar Marca'}
              </button>
            </div>
          </form>

          {/* Lista */}
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600 w-8 h-8"/></div>
          ) : (
            <div className="space-y-3">
              {brands.map(brand => (
                <div key={brand.id} className={`flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-all ${brand.is_active ? 'border-gray-100' : 'border-red-100 bg-red-50/50'}`}>
                  <div>
                    <div className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                      {brand.name}
                      {!brand.is_active && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Inactivo</span>}
                    </div>
                    {brand.description && <div className="text-xs text-gray-500 mt-1">{brand.description}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(brand)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                      <Edit2 size={18}/>
                    </button>
                    {brand.is_active == 1 && (
                      <button onClick={() => handleDelete(brand.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Desactivar">
                        <Trash2 size={18}/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {brands.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <Tag className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500 font-medium">No hay marcas registradas.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
