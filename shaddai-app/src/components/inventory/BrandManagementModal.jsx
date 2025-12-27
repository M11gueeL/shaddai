import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save, Loader2, Tag } from 'lucide-react';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../api/inventoryApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function BrandManagementModal({ onClose }) {
  const { token } = useAuth();
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
    if (!window.confirm("¿Seguro que deseas desactivar esta marca?")) return;
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
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              {editingId ? <Edit2 size={16}/> : <Plus size={16}/>}
              {editingId ? 'Editar Marca' : 'Nueva Marca'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Nombre (Ej. La Santé)" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Descripción (Opcional)" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              {editingId && (
                <button type="button" onClick={handleCancel} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  Cancelar
                </button>
              )}
              <button 
                type="submit" 
                disabled={submitting}
                className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>

          {/* Lista */}
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-600"/></div>
          ) : (
            <div className="space-y-2">
              {brands.map(brand => (
                <div key={brand.id} className={`flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition ${brand.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50 opacity-75'}`}>
                  <div>
                    <div className="font-medium text-gray-800 flex items-center gap-2">
                      {brand.name}
                      {!brand.is_active && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Inactivo</span>}
                    </div>
                    {brand.description && <div className="text-xs text-gray-500">{brand.description}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(brand)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                      <Edit2 size={16}/>
                    </button>
                    {brand.is_active == 1 && (
                      <button onClick={() => handleDelete(brand.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {brands.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">No hay marcas registradas.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
