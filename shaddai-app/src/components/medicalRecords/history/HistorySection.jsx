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
    <div className="rounded-xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm">
      <div className="p-4">
        <div className="text-slate-900 font-medium">Antecedentes</div>
        <div className="text-sm text-slate-500">Registra antecedentes relevantes del paciente. Usa descripciones breves y claras.</div>
      </div>
      <div className="p-4 border-t">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">Tipo</label>
            <div className="relative mt-1">
              <select className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 pr-8 appearance-none focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={form.history_type} onChange={(e)=>setForm({...form, history_type:e.target.value})}>
                <option>Antecedente</option>
                <option>Patológico</option>
                <option>No patológico</option>
                <option>Quirúrgico</option>
                <option>Farmacológico</option>
                <option>Alérgico</option>
                <option>Familiar</option>
                <option>Gineco-obstétrico</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">▾</span>
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="text-sm text-slate-600">Descripción</label>
            <textarea rows={2} className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" placeholder="Ej.: Alergia a penicilina. Apendicectomía (2018). HTA en la madre." value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} required />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm text-slate-600">Fecha</label>
            <input type="date" className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={form.recorded_at} onChange={(e)=>setForm({...form, recorded_at:e.target.value})} />
          </div>
          <div className="md:col-span-6 flex justify-end">
            <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700">Añadir</button>
          </div>
        </form>
      </div>
      <div className="divide-y">
        {items?.length ? items.map(h => (
          <HistoryItem key={h.id} item={h} onSave={update} onDelete={remove} />
        )) : <div className="px-4 py-6 text-sm text-slate-500">Sin antecedentes</div>}
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
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-600">{item.history_type}</span>
        {item.recorded_at && <span>{item.recorded_at.substring(0,10)}</span>}
      </div>
      {editing ? (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-6 gap-2">
          <textarea rows={2} className="md:col-span-4 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={desc} onChange={(e)=>setDesc(e.target.value)} />
          <input type="date" className="md:col-span-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={date} onChange={(e)=>setDate(e.target.value)} />
          <div className="md:col-span-1 flex justify-end gap-2">
            <button onClick={save} className="rounded-lg bg-blue-600 px-3 py-2 text-white shadow hover:bg-blue-700">Guardar</button>
            <button onClick={()=>setEditing(false)} className="rounded-lg border px-3 py-2">Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-2">
          <div className="flex-1 text-sm text-slate-800">{item.description}</div>
          <button onClick={()=>setEditing(true)} className="text-xs text-blue-600 hover:underline">Editar</button>
          <button onClick={()=>onDelete(item.id)} className="text-xs text-red-600 hover:underline">Eliminar</button>
        </div>
      )}
    </div>
  );
}
