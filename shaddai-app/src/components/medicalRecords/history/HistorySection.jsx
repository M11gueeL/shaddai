import React, { useEffect, useState } from 'react';
import { History, AlertTriangle, Pill, Scissors, Users, Baby, FileText, Calendar, Save, Trash2, Edit2, Plus, X } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-start gap-4">
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <History className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-slate-800">Antecedentes Médicos</h3>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Registre el historial médico relevante del paciente, incluyendo alergias, cirugías previas, antecedentes familiares y condiciones crónicas.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 sticky top-6">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-600" /> Nuevo Antecedente
                </h4>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Tipo</label>
                        <div className="relative">
                            <select 
                                className="w-full appearance-none rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" 
                                value={form.history_type} 
                                onChange={(e)=>setForm({...form, history_type:e.target.value})}
                            >
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
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Descripción</label>
                        <textarea 
                            rows={4} 
                            className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none placeholder:text-slate-400 resize-none" 
                            placeholder="Ej.: Alergia a penicilina. Apendicectomía (2018). HTA en la madre." 
                            value={form.description} 
                            onChange={(e)=>setForm({...form, description:e.target.value})} 
                            required 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Fecha (Opcional)</label>
                        <input 
                            type="date" 
                            className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" 
                            value={form.recorded_at} 
                            onChange={(e)=>setForm({...form, recorded_at:e.target.value})} 
                        />
                    </div>
                    <div className="pt-2">
                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
                            <Plus className="w-4 h-4" /> Añadir Registro
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-4">
            {items?.length ? items.map(h => (
                <HistoryItem key={h.id} item={h} onSave={update} onDelete={remove} />
            )) : (
                <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-12 text-center">
                    <History className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-slate-900 font-medium">Sin antecedentes registrados</h3>
                    <p className="text-slate-500 text-sm mt-1">Utilice el formulario para añadir información al historial.</p>
                </div>
            )}
        </div>
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

  const getIcon = (type) => {
    switch(type) {
        case 'Alérgico': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case 'Farmacológico': return <Pill className="w-5 h-5 text-blue-500" />;
        case 'Quirúrgico': return <Scissors className="w-5 h-5 text-rose-500" />;
        case 'Familiar': return <Users className="w-5 h-5 text-purple-500" />;
        case 'Gineco-obstétrico': return <Baby className="w-5 h-5 text-pink-500" />;
        default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBgColor = (type) => {
    switch(type) {
        case 'Alérgico': return 'bg-amber-50 border-amber-100';
        case 'Farmacológico': return 'bg-blue-50 border-blue-100';
        case 'Quirúrgico': return 'bg-rose-50 border-rose-100';
        case 'Familiar': return 'bg-purple-50 border-purple-100';
        case 'Gineco-obstétrico': return 'bg-pink-50 border-pink-100';
        default: return 'bg-white border-slate-100';
    }
  };

  if (editing) {
    return (
        <div className="rounded-2xl bg-white p-4 shadow-lg ring-2 ring-indigo-500/20 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{item.history_type}</span>
                <button onClick={() => setEditing(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <textarea 
                className="w-full rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none mb-3 resize-none"
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
            />
            <div className="flex items-center gap-3">
                <input 
                    type="date" 
                    className="flex-1 rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <button onClick={save} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    Guardar
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className={`group rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${getBgColor(item.history_type)}`}>
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
            {getIcon(item.history_type)}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
                <h5 className="font-bold text-slate-800 text-sm">{item.history_type}</h5>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditing(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
            {item.recorded_at && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.recorded_at).toLocaleDateString()}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
