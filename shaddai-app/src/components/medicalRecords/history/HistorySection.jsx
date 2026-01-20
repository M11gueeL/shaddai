import React, { useEffect, useState } from 'react';
import { History, AlertTriangle, Pill, Scissors, Users, Baby, FileText, Calendar, Save, Trash2, Edit2, Plus, X } from 'lucide-react';
import medicalRecordsApi from '../../../api/medicalRecords';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';

export default function HistorySection({ recordId, token }) {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ history_type: 'other', description: '', recorded_at: '' });

  const load = async () => {
    try {
      // CORRECCIÓN 1: Usar el nombre correcto del método de la API
      const res = await medicalRecordsApi.getHistory(recordId, null);
      setItems(res.data || []);
    } catch (e) {
      console.error('Error cargando antecedentes:', e);
      setItems([]);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [recordId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.description) return;
    try {
      // CORRECCIÓN 2: Usar el nombre correcto del método de la API
      await medicalRecordsApi.addHistory(recordId, form, token);
      toast.success('Antecedente añadido');
      setForm({ history_type: form.history_type, description: '', recorded_at: '' });
      load();
    } catch (e) { toast.error('No se pudo añadir'); }
  };

  const update = async (id, description, recorded_at, history_type) => {
    try {
      // CORRECCIÓN 3: Usar el nombre correcto del método de la API
      await medicalRecordsApi.updateHistory(id, { description, recorded_at, history_type }, token);
      toast.success('Actualizado');
      load();
    } catch (e) { toast.error('No se pudo actualizar'); }
  };

  const remove = async (id) => {
    if (await confirm({ 
        title: 'Eliminar antecedente', 
        message: '¿Está seguro de eliminar este registro del historial médico?',
        tone: 'danger',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
    })) {
        try {
            // CORRECCIÓN 4: Usar el nombre correcto del método de la API
            await medicalRecordsApi.deleteHistory(id, token);
            toast.success('Eliminado');
            load();
        } catch (e) { toast.error('No se pudo eliminar'); }
    }
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
                                <option value="other">Antecedente</option>
                                <option value="personal_pathological">Patológico</option>
                                <option value="personal_non_pathological">No patológico</option>
                                <option value="surgical">Quirúrgico</option>
                                <option value="medications">Farmacológico</option>
                                <option value="allergies">Alérgico</option>
                                <option value="family">Familiar</option>
                                <option value="gynecological">Gineco-obstétrico</option>
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
        <div className="lg:col-span-2">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #f8fafc;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #cbd5e1;
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #94a3b8;
                }
            `}</style>
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar p-2">
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
    </div>
  );
}

const getHistoryTypeLabel = (type) => {
    const map = {
        'personal_pathological': 'Patológico',
        'personal_non_pathological': 'No patológico',
        'surgical': 'Quirúrgico',
        'medications': 'Farmacológico',
        'allergies': 'Alérgico',
        'family': 'Familiar',
        'gynecological': 'Gineco-obstétrico',
        'other': 'Antecedente',
        'habits': 'Hábitos',
        'vaccinations': 'Vacunación',
        'Patológico': 'Patológico',
        'No patológico': 'No patológico',
        'Quirúrgico': 'Quirúrgico',
        'Farmacológico': 'Farmacológico',
        'Alérgico': 'Alérgico',
        'Familiar': 'Familiar',
        'Gineco-obstétrico': 'Gineco-obstétrico',
        'Antecedente': 'Antecedente'
    };
    return map[type] || type || 'Antecedente';
};

// Función auxiliar para formatear la fecha con seguridad
const formatHistoryDate = (dateString) => {
    if (!dateString) return 'Sin fecha registrada';
    const date = new Date(dateString);
    // Verificar si la fecha es inválida (getTime devuelve NaN)
    if (isNaN(date.getTime())) return 'Sin fecha registrada';
    
    return date.toLocaleDateString();
};

function HistoryItem({ item, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(item.description);
  const [date, setDate] = useState(item.recorded_at?.substring(0,10) || '');
  const [type, setType] = useState(item.history_type || 'other');

  const save = async () => {
    await onSave(item.id, desc, date, type);
    setEditing(false);
  };

  const getIcon = (type) => {
    switch(type) {
        case 'allergies':
        case 'Alérgico': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case 'medications':
        case 'Farmacológico': return <Pill className="w-5 h-5 text-blue-500" />;
        case 'surgical':
        case 'Quirúrgico': return <Scissors className="w-5 h-5 text-rose-500" />;
        case 'family':
        case 'Familiar': return <Users className="w-5 h-5 text-purple-500" />;
        case 'gynecological':
        case 'Gineco-obstétrico': return <Baby className="w-5 h-5 text-pink-500" />;
        default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBgColor = (type) => {
    switch(type) {
        case 'allergies':
        case 'Alérgico': return 'bg-amber-50 border-amber-100';
        case 'medications':
        case 'Farmacológico': return 'bg-blue-50 border-blue-100';
        case 'surgical':
        case 'Quirúrgico': return 'bg-rose-50 border-rose-100';
        case 'family':
        case 'Familiar': return 'bg-purple-50 border-purple-100';
        case 'gynecological':
        case 'Gineco-obstétrico': return 'bg-pink-50 border-pink-100';
        default: return 'bg-white border-slate-100';
    }
  };

  if (editing) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-lg ring-2 ring-indigo-500/20 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <h5 className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                    <Edit2 className="w-4 h-4" /> Editar Antecedente
                </h5>
                <button onClick={() => setEditing(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Tipo de Antecedente</label>
                    <div className="relative">
                        <select 
                            className="w-full appearance-none rounded-xl border-0 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" 
                            value={type} 
                            onChange={(e)=>setType(e.target.value)}
                        >
                            <option value="other">Antecedente</option>
                            <option value="personal_pathological">Patológico</option>
                            <option value="personal_non_pathological">No patológico</option>
                            <option value="surgical">Quirúrgico</option>
                            <option value="medications">Farmacológico</option>
                            <option value="allergies">Alérgico</option>
                            <option value="family">Familiar</option>
                            <option value="gynecological">Gineco-obstétrico</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Fecha (Opcional)</label>
                    <input 
                        type="date" 
                        className="w-full rounded-xl border-0 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Descripción</label>
                <textarea 
                    className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none"
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => setEditing(false)} className="px-4 py-2 text-slate-500 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors">
                    Cancelar
                </button>
                <button onClick={save} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                    Guardar Cambios
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
                <h5 className="font-bold text-slate-800 text-sm">{getHistoryTypeLabel(item.history_type)}</h5>
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
            {/* CORRECCIÓN DE FECHA: Validamos antes de mostrar */}
            <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {formatHistoryDate(item.recorded_at)}
            </div>
        </div>
      </div>
    </div>
  );
}