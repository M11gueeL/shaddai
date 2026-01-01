import React, { useEffect, useMemo, useState } from 'react';
import { X, Activity, FileText, Stethoscope, ClipboardList, Pill, StickyNote, Trash2, Plus, Save, Calendar, User, Briefcase } from 'lucide-react';
import medicalRecordsApi from '../../../api/medicalRecords';
import { useToast } from '../../../context/ToastContext';

export default function EncounterDetailModal({ encounterId, token, onClose, onChanged }) {
  const toast = useToast();
  const [encounter, setEncounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const load = async () => {
    setLoading(true);
    try {
      const res = await medicalRecordsApi.getEncounterById(encounterId, token);
      setEncounter(res.data);
    } catch (e) {
      toast.error('No se pudo cargar el encuentro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    setExam({});
    setVitals({});
    setDiag({ diagnosis_description: '', diagnosis_type: 'principal', notes: '' });
    setPlan({ plan_type: 'Receta', description: '', status: 'active' });
    setNote({ note_type: 'Evolución', note_content: '' });
    load(); 
    /* eslint-disable-next-line */ 
  }, [encounterId]);

  const tabs = useMemo(() => ([
    { key: 'overview', label: 'Resumen', icon: FileText },
    { key: 'exam', label: 'Ex. físico', icon: Stethoscope },
    { key: 'vitals', label: 'Signos', icon: Activity },
    { key: 'diagnoses', label: 'Diagnósticos', icon: ClipboardList },
    { key: 'plans', label: 'Tratamientos', icon: Pill },
    { key: 'notes', label: 'Notas', icon: StickyNote },
  ]), []);

  const [exam, setExam] = useState({});
  const [vitals, setVitals] = useState({});
  const [diag, setDiag] = useState({ diagnosis_description: '', diagnosis_type: 'principal', notes: '' });
  const [plan, setPlan] = useState({ plan_type: 'Receta', description: '', status: 'active' });
  const [note, setNote] = useState({ note_type: 'Evolución', note_content: '' });

  useEffect(() => {
    if (encounter) {
       if (encounter.physical_exam) {
          // Si por casualidad llega como array, tomamos el primero [0]
          const examData = Array.isArray(encounter.physical_exam) 
              ? encounter.physical_exam[0] 
              : encounter.physical_exam;
          
          if (examData) setExam(examData);
       }

       if (encounter.vital_signs) {
          // Detectamos si viene como lista ([...]) o como objeto ({...})
          const vitalsData = Array.isArray(encounter.vital_signs) 
              ? encounter.vital_signs[0] 
              : encounter.vital_signs;
              
          if (vitalsData) setVitals(vitalsData);
       }
    }
  }, [encounter]);

  const saveExam = async (e) => {
    e.preventDefault();

    const examFields = ['vitals_summary','general_appearance','head_neck','chest_lungs','cardiovascular','abdomen','extremities','neurological','skin','specialty_specific_exam','notes'];
    const hasData = examFields.some(key => exam[key] && String(exam[key]).trim().length > 0);

    if (!hasData) {
        toast.error('Debe completar al menos un campo del examen físico');
        return;
    }

    try {
      await medicalRecordsApi.savePhysicalExam(encounterId, exam, token);
      toast.success('Examen guardado');
      await load();
    } catch (e) { toast.error('No se pudo guardar'); }
  };

  const addVitals = async (e) => {
    e.preventDefault();

    const vitalFields = ['systolic_bp','diastolic_bp','heart_rate','respiratory_rate','temperature','oxygen_saturation','weight','height', 'notes'];
    const hasData = vitalFields.some(key => vitals[key] && String(vitals[key]).trim().length > 0);

    if (!hasData) {
        toast.error('Debe registrar al menos un signo vital o nota');
        return;
    }

    try {
      await medicalRecordsApi.addVitalSignsForEncounter(encounterId, vitals, token);
      toast.success('Signos registrados');
      await load();
      onChanged?.();
    } catch (e) { toast.error('No se pudo registrar signos'); }
  };

  const addDiagnosis = async (e) => {
    e.preventDefault();
    try {
      await medicalRecordsApi.addDiagnosis(encounterId, diag, token);
      toast.success('Diagnóstico añadido');
      await load();
      setDiag({ diagnosis_description: '', diagnosis_type: 'principal', notes: '' });
      onChanged?.();
    } catch (e) { toast.error('No se pudo añadir'); }
  };

  const deleteDiagnosis = async (id) => {
    try {
      await medicalRecordsApi.deleteDiagnosis(id, token);
      toast.success('Diagnóstico eliminado');
      await load();
      onChanged?.();
    } catch (e) { toast.error('No se pudo eliminar'); }
  };

  const addPlan = async (e) => {
    e.preventDefault();

    if (!plan.description?.trim()) {
        toast.error('La descripción del tratamiento es obligatoria');
        return;
    }

    try {
      await medicalRecordsApi.addTreatmentPlan(encounterId, plan, token);
      toast.success('Plan añadido');
      await load();
      setPlan({ plan_type: 'Receta', description: '', status: 'active' });
      onChanged?.();
    } catch (e) { toast.error('No se pudo añadir'); }
  };

  const deletePlan = async (id) => {
    try {
      await medicalRecordsApi.deleteTreatmentPlan(id, token);
      toast.success('Plan eliminado');
      await load();
      onChanged?.();
    } catch (e) { toast.error('No se pudo eliminar'); }
  };

  const addNote = async (e) => {
    e.preventDefault();
    try {
      await medicalRecordsApi.addProgressNote(encounterId, note, token);
      toast.success('Nota añadida');
      await load();
      setNote({ note_type: 'Evolución', note_content: '' });
    } catch (e) { toast.error('No se pudo añadir'); }
  };

  // Derivados para UX
  const bmiPreview = (() => {
    const w = parseFloat(vitals?.weight);
    const h = parseFloat(vitals?.height);
    if (w && h && h > 0) return (w / (h * h)).toFixed(2);
    return '';
  })();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-50 px-6 py-4 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <FileText className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Detalle de Consulta</h3>
                <p className="text-xs text-slate-500 font-medium">ID: {encounterId}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
            <div className="flex-1 flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : (
          encounter ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Tabs */}
              <div className="px-6 pt-4 pb-2 border-b border-slate-50">
                <div className="flex gap-1 flex-wrap">
                    {tabs.map(t => {
                        const Icon = t.icon;
                        const isActive = tab === t.key;
                        return (
                            <button 
                                key={t.key} 
                                onClick={() => setTab(t.key)}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                    ${isActive 
                                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                {t.label}
                            </button>
                        );
                    })}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {tab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" /> Datos Generales
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <Briefcase className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium uppercase">Especialidad</div>
                                        <div className="text-slate-800 font-medium">{encounter.specialty_name}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <User className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium uppercase">Médico</div>
                                        <div className="text-slate-800 font-medium">{encounter.doctor_name}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium uppercase">Fecha</div>
                                        <div className="text-slate-800 font-medium">{new Date(encounter.encounter_date).toLocaleString()}</div>
                                    </div>
                                </div>
                                
                                {encounter.chief_complaint && (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <div className="text-xs text-slate-500 font-medium uppercase mb-1">Motivo de Consulta</div>
                                        <p className="text-slate-700 leading-relaxed">{encounter.chief_complaint}</p>
                                    </div>
                                )}
                                {encounter.present_illness && (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <div className="text-xs text-slate-500 font-medium uppercase mb-1">Enfermedad Actual</div>
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{encounter.present_illness}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-slate-400" /> Diagnósticos
                            </h4>
                            <ul className="space-y-3">
                            {encounter.diagnoses?.length ? encounter.diagnoses.map(d => (
                                <li key={d.id} className="group flex items-start justify-between bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all">
                                <div>
                                    <div className="font-semibold text-slate-800">{d.diagnosis_description}</div>
                                    <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-blue-100">
                                        {d.diagnosis_type}
                                    </div>
                                </div>
                                <button 
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" 
                                    onClick={() => deleteDiagnosis(d.id)}
                                    title="Eliminar diagnóstico"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                </li>
                            )) : (
                                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No hay diagnósticos registrados</p>
                                </div>
                            )}
                            </ul>
                        </div>
                        </div>
                    )}

                    {tab === 'exam' && (
                        <form onSubmit={saveExam} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['vitals_summary','general_appearance','head_neck','chest_lungs','cardiovascular','abdomen','extremities','neurological','skin','specialty_specific_exam','notes'].map(k => (
                                    <div key={k} className={k==='notes' ? 'md:col-span-2' : ''}>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">{labelForExamField(k)}</label>
                                    <textarea
                                        rows={k==='notes'?4:3}
                                        className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400 resize-none"
                                        placeholder={placeholderForExamField(k)}
                                        value={exam?.[k] || ''}
                                        onChange={(e)=>setExam({...exam,[k]:e.target.value})}
                                    />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-end">
                                <button 
                                    type="submit" 
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
                                >
                                    <Save className="w-4 h-4" /> Guardar Examen
                                </button>
                            </div>
                        </form>
                    )}

                    {tab === 'vitals' && (
                        <form onSubmit={addVitals} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    ['systolic_bp','PA sistólica','mmHg','1'],
                                    ['diastolic_bp','PA diastólica','mmHg','1'],
                                    ['heart_rate','Pulso','lpm','1'],
                                    ['respiratory_rate','Frecuencia respiratoria','rpm','1'],
                                    ['temperature','Temperatura','°C','0.1'],
                                    ['oxygen_saturation','Sat. de oxígeno','%','1'],
                                    ['weight','Peso','kg','0.1'],
                                    ['height','Altura','m','0.01'],
                                ].map(([k, lbl, unit, step]) => (
                                    <div key={k}>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">{lbl}</label>
                                    <div className="relative">
                                        <input
                                        type="number"
                                        step={step}
                                        className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400"
                                        placeholder="0"
                                        value={vitals?.[k] || ''}
                                        onChange={(e)=>setVitals({...vitals,[k]:e.target.value})}
                                        />
                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">{unit}</span>
                                    </div>
                                    </div>
                                ))}
                                
                                <div className="col-span-2 md:col-span-3">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Notas Adicionales</label>
                                    <input
                                        className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400"
                                        placeholder="Ej.: Medición en reposo, brazo derecho."
                                        value={vitals?.notes || ''}
                                        onChange={(e)=>setVitals({...vitals,notes:e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">IMC (Calculado)</label>
                                    <div className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 border border-slate-200 text-center">
                                        {bmiPreview || '—'}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-end">
                                <button 
                                    type="submit" 
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" /> Registrar Signos
                                </button>
                            </div>
                        </form>
                    )}

                    {tab === 'diagnoses' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <form onSubmit={addDiagnosis} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-blue-600" /> Añadir Diagnóstico
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Descripción</label>
                                    <input 
                                        className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400" 
                                        placeholder="Ej.: Gastroenteritis aguda" 
                                        value={diag.diagnosis_description} 
                                        onChange={(e)=>setDiag({...diag, diagnosis_description:e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tipo</label>
                                    <div className="flex gap-2">
                                        {['principal','secundario'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setDiag({...diag, diagnosis_type: t})}
                                            className={`
                                                flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all border
                                                ${diag.diagnosis_type===t 
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }
                                            `}
                                        >
                                            {t.charAt(0).toUpperCase()+t.slice(1)}
                                        </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Notas</label>
                                    <input 
                                        className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400" 
                                        placeholder="Contexto adicional, criterios usados, etc." 
                                        value={diag.notes} 
                                        onChange={(e)=>setDiag({...diag, notes:e.target.value})} 
                                    />
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
                                        <Plus className="w-4 h-4" /> Añadir
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-slate-400" /> Diagnósticos Registrados
                            </h4>
                            <ul className="space-y-3">
                            {encounter.diagnoses?.length ? encounter.diagnoses.map(d => (
                                <li key={d.id} className="group flex items-start justify-between bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all">
                                <div>
                                    <div className="font-semibold text-slate-800">{d.diagnosis_description}</div>
                                    <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-blue-100">
                                        {d.diagnosis_type}
                                    </div>
                                    {d.notes && <p className="text-xs text-slate-500 mt-2 italic">"{d.notes}"</p>}
                                </div>
                                <button 
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" 
                                    onClick={() => deleteDiagnosis(d.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                </li>
                            )) : (
                                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No hay diagnósticos registrados</p>
                                </div>
                            )}
                            </ul>
                        </div>
                        </div>
                    )}

                    {tab === 'plans' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <form onSubmit={addPlan} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-blue-600" /> Añadir Tratamiento
                            </h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Tipo</label>
                                        <select 
                                            className="w-full appearance-none rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                                            value={plan.plan_type} 
                                            onChange={(e)=>setPlan({...plan, plan_type:e.target.value})}
                                        >
                                            <option>Receta</option>
                                            <option>Reposo</option>
                                            <option>Indicaciones</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Estado</label>
                                        <select 
                                            className="w-full appearance-none rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                                            value={plan.status} 
                                            onChange={(e)=>setPlan({...plan, status:e.target.value})}
                                        >
                                            <option value="active">Activo</option>
                                            <option value="completed">Completado</option>
                                            <option value="cancelled">Cancelado</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Descripción</label>
                                    <textarea 
                                        rows={3} 
                                        className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400 resize-none" 
                                        placeholder="Detalle del plan: fármacos, dosis, duración o indicaciones específicas." 
                                        value={plan.description} 
                                        onChange={(e)=>setPlan({...plan, description:e.target.value})} 
                                        required
                                    />
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
                                        <Plus className="w-4 h-4" /> Añadir
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Pill className="w-4 h-4 text-slate-400" /> Planes Activos
                            </h4>
                            <ul className="space-y-3">
                            {encounter.treatment_plans?.length ? encounter.treatment_plans.map(p => (
                                <li key={p.id} className="group flex items-start justify-between bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{p.plan_type}</span>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {p.status === 'active' ? 'Activo' : p.status}
                                        </span>
                                    </div>
                                    <div className="text-slate-700 text-sm leading-relaxed">{p.description}</div>
                                </div>
                                <button 
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" 
                                    onClick={() => deletePlan(p.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                </li>
                            )) : (
                                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No hay planes registrados</p>
                                </div>
                            )}
                            </ul>
                        </div>
                        </div>
                    )}

                    {tab === 'notes' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <form onSubmit={addNote} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-blue-600" /> Añadir Nota
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Tipo</label>
                                    <select 
                                        className="w-full appearance-none rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                                        value={note.note_type} 
                                        onChange={(e)=>setNote({...note, note_type:e.target.value})}
                                    >
                                        <option>Evolución</option>
                                        <option>Epicrisis</option>
                                        <option>Indicación</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Contenido</label>
                                    <textarea 
                                        rows={6} 
                                        className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400 resize-none" 
                                        placeholder="Hallazgos, evolución clínica, indicaciones o decisiones tomadas." 
                                        value={note.note_content} 
                                        onChange={(e)=>setNote({...note, note_content:e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
                                        <Plus className="w-4 h-4" /> Añadir Nota
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <StickyNote className="w-4 h-4 text-slate-400" /> Historial de Notas
                            </h4>
                            <ul className="space-y-4">
                            {encounter.progress_notes?.length ? encounter.progress_notes.map(n => (
                                <li key={n.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200/50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">{n.note_type}</span>
                                            <span className="text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="text-xs font-medium text-slate-500">{n.author_name}</div>
                                    </div>
                                    <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{n.note_content}</div>
                                </li>
                            )) : (
                                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No hay notas registradas</p>
                                </div>
                            )}
                            </ul>
                        </div>
                        </div>
                    )}
                </div>
              </div>
            </div>
          ) : (<div className="p-12 text-center text-slate-500">No se encontró el encuentro</div>)
        )}
      </div>
    </div>
  );
}

function labelForExamField(key) {
  const map = {
    vitals_summary: 'Resumen de signos vitales',
    general_appearance: 'Apariencia general',
    head_neck: 'Cabeza y cuello',
    chest_lungs: 'Tórax y pulmones',
    cardiovascular: 'Cardiovascular',
    abdomen: 'Abdomen',
    extremities: 'Extremidades',
    neurological: 'Neurológico',
    skin: 'Piel',
    specialty_specific_exam: 'Examen específico',
    notes: 'Notas'
  };
  return map[key] || key;
}

function placeholderForExamField(key) {
  const map = {
    vitals_summary: 'Ej.: PA 120/80, FC 72 lpm, FR 16 rpm, Temp 36.8 °C, SatO₂ 98%…',
    general_appearance: 'Estado general, hidratación, dolor aparente, marcha…',
    head_neck: 'Cráneo, ojos, oídos, nariz, boca, cuello…',
    chest_lungs: 'Simetría, ruidos respiratorios, adventicios…',
    cardiovascular: 'Ruidos cardiacos, soplos, edemas…',
    abdomen: 'Inspección, palpación, percusión, auscultación…',
    extremities: 'Fuerza, tono, movilidad, edema…',
    neurological: 'Consciencia, pares craneales, sensibilidad, reflejos…',
    skin: 'Coloración, lesiones, temperatura…',
    specialty_specific_exam: 'Hallazgos dirigidos a la especialidad…',
    notes: 'Observaciones adicionales relevantes…'
  };
  return map[key] || '';
}
