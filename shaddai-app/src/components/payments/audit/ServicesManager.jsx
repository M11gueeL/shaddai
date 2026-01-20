import React, { useEffect, useState } from 'react';
import { Edit2, DollarSign, Trash2, History } from 'lucide-react';
import * as servicesApi from '../../../api/services';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';

export default function ServicesManager() {
  const { token } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price_usd: '', is_active: 1 });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await servicesApi.listServices();
      setItems(res.data || []);
    } catch (e) { toast.error('No se pudo cargar servicios'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      setSaving(true);
      if (editing) await servicesApi.updateService(editing.id, form);
      else await servicesApi.createService(form);
      toast.success(editing ? 'Servicio actualizado' : 'Servicio creado');
      setForm({ name: '', price_usd: '', is_active: 1 }); setEditing(null);
      await load();
    } catch (e) { toast.error(e?.response?.data?.error || 'No se pudo guardar'); }
    finally { setSaving(false); }
  };

  const askDelete = async (id) => {
    if (!await confirm({ title: 'Eliminar servicio', tone: 'danger', message: '¿Deseas eliminar este servicio?' })) return;
    try { await servicesApi.deleteService(id); toast.success('Eliminado'); load(); } catch (e) { toast.error(e?.response?.data?.error || 'No se pudo eliminar'); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Form (1/3) */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sticky top-6">
           <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
             <Edit2 className="w-5 h-5 text-indigo-600" />
             {editing ? 'Editar Servicio' : 'Nuevo Servicio'}
           </h3>
           
           <div className="space-y-4">
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nombre del Servicio</label>
                 <input 
                   className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                   placeholder="Ej: Consulta General" 
                   value={form.name} 
                   onChange={(e) => setForm(f => ({...f, name: e.target.value}))} 
                 />
              </div>
              
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Precio (USD)</label>
                 <div className="relative mt-1">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="number" 
                      step="0.01" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                      placeholder="0.00" 
                      value={form.price_usd} 
                      onChange={(e) => setForm(f => ({...f, price_usd: e.target.value}))} 
                    />
                 </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="active_check"
                  checked={!!Number(form.is_active)} 
                  onChange={(e) => setForm(f => ({...f, is_active: e.target.checked ? 1 : 0}))} 
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500/20"
                /> 
                <label htmlFor="active_check" className="text-sm font-medium text-gray-700 cursor-pointer">Servicio Activo</label>
              </div>

              <div className="flex gap-2 pt-2">
                 {editing && (
                   <button 
                     onClick={() => { setEditing(null); setForm({ name: '', price_usd: '', is_active: 1 }); }} 
                     className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 flex-1 transition-colors"
                   >
                     Cancelar
                   </button>
                 )}
                 <button 
                   disabled={saving || !form.name || !form.price_usd} 
                   onClick={submit} 
                   className="px-4 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 flex-1 shadow-lg shadow-gray-900/10 transition-all"
                 >
                   {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Servicio'}
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* List (2/3) */}
      <div className="lg:col-span-2">
         <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-900">Catalogo de Servicios</h3>
               <button onClick={load} className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-indigo-600 transition-all"><History className="w-5 h-5"/></button>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                     <tr>
                        <th className="text-left px-6 py-4">Nombre</th>
                        <th className="text-right px-6 py-4">Precio</th>
                        <th className="text-center px-6 py-4">Estado</th>
                        <th className="text-right px-6 py-4">Acciones</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {loading ? (
                        <tr><td colSpan={4} className="p-10 text-center text-gray-400">Cargando catálogo...</td></tr>
                     ) : items.length === 0 ? (
                        <tr><td colSpan={4} className="p-10 text-center text-gray-400">No hay servicios registrados</td></tr>
                     ) : items.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                           <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                           <td className="px-6 py-4 text-right font-mono text-gray-600">${Number(s.price_usd).toFixed(2)}</td>
                           <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${Number(s.is_active) ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                 {Number(s.is_active) ? 'ACTIVO' : 'INACTIVO'}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                 <button 
                                   onClick={() => { setEditing(s); setForm({ name: s.name, price_usd: s.price_usd, is_active: s.is_active }); }} 
                                   className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                 >
                                    <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button 
                                   onClick={() => askDelete(s.id)} 
                                   className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
