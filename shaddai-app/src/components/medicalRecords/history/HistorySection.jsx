import React, { useEffect, useState } from 'react';
import medicalRecordsApi from '../../../api/medicalRecords';
import { useToast } from '../../../context/ToastContext';

export default function HistorySection({ recordId, token }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ history_type: 'Antecedente', description: '', recorded_at: '' });

  const load = async () => {
    try {
      const res = await medicalRecordsApi.getHistory(recordId, token);
      setItems(res.data || []);
    } catch (e) {
      setItems([]);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [recordId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.description) return;
    try {
      await medicalRecordsApi.addHistory(recordId, form, token);
      toast.success('Antecedente añadido');
      setForm({ history_type: form.history_type, description: '', recorded_at: '' });
      load();
    } catch (e) { toast.error('No se pudo añadir'); }
  };

  const update = async (id, description, recorded_at) => {
    try {
      await medicalRecordsApi.updateHistory(id, { description, recorded_at }, token);
      toast.success('Actualizado');
      load();
    } catch (e) { toast.error('No se pudo actualizar'); }
  };

  const remove = async (id) => {
    try {
      await medicalRecordsApi.deleteHistory(id, token);
      toast.success('Eliminado');
      load();
    } catch (e) { toast.error('No se pudo eliminar'); }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <div className="text-gray-800 font-medium">Antecedentes</div>
      </div>
      <div className="p-4 border-t">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm text-gray-600">Tipo</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.history_type} onChange={(e)=>setForm({...form, history_type:e.target.value})}>
              <option>Antecedente</option>
              <option>Patológico</option>
              <option>No patológico</option>
              <option>Quirúrgico</option>
              <option>Farmacológico</option>
              <option>Alérgico</option>
              <option>Familiar</option>
              <option>Gineco-obstétrico</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Descripción</label>
            <input className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Fecha</label>
            <input type="date" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.recorded_at} onChange={(e)=>setForm({...form, recorded_at:e.target.value})} />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Añadir</button>
          </div>
        </form>
      </div>
      <div className="divide-y">
        {items?.length ? items.map(h => (
          <HistoryItem key={h.id} item={h} onSave={update} onDelete={remove} />
        )) : <div className="px-4 py-6 text-sm text-gray-500">Sin antecedentes</div>}
      </div>
    </div>
  );
}

function HistoryItem({ item, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(item.description);
  const [date, setDate] = useState(item.recorded_at?.substring(0,10) || '');

  const save = async () => {
    await onSave(item.id, desc, date);
    setEditing(false);
  };

  return (
    <div className="px-4 py-3">
      <div className="text-xs text-gray-500">{item.history_type}</div>
      {editing ? (
        <div className="mt-1 grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="md:col-span-4 px-3 py-2 border rounded-lg" value={desc} onChange={(e)=>setDesc(e.target.value)} />
          <input type="date" className="md:col-span-1 px-3 py-2 border rounded-lg" value={date} onChange={(e)=>setDate(e.target.value)} />
          <div className="md:col-span-1 flex justify-end gap-2">
            <button onClick={save} className="px-3 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
            <button onClick={()=>setEditing(false)} className="px-3 py-2 border rounded-lg">Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 text-sm text-gray-800">{item.description}</div>
          <div className="text-xs text-gray-500">{item.recorded_at?.substring(0,10)}</div>
          <button onClick={()=>setEditing(true)} className="text-xs text-blue-600 hover:underline">Editar</button>
          <button onClick={()=>onDelete(item.id)} className="text-xs text-red-600 hover:underline">Eliminar</button>
        </div>
      )}
    </div>
  );
}
