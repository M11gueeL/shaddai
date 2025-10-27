import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
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

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [encounterId]);

  const tabs = useMemo(() => ([
    { key: 'overview', label: 'Resumen' },
    { key: 'exam', label: 'Ex. físico' },
    { key: 'vitals', label: 'Signos' },
    { key: 'diagnoses', label: 'Diagnósticos' },
    { key: 'plans', label: 'Tratamientos' },
    { key: 'notes', label: 'Notas' },
  ]), []);

  const [exam, setExam] = useState({});
  const [vitals, setVitals] = useState({});
  const [diag, setDiag] = useState({ diagnosis_description: '', diagnosis_type: 'principal', notes: '' });
  const [plan, setPlan] = useState({ plan_type: 'Receta', description: '', status: 'active' });
  const [note, setNote] = useState({ note_type: 'Evolución', note_content: '' });

  useEffect(() => {
    if (encounter?.physical_exam) setExam(encounter.physical_exam);
  }, [encounter]);

  const saveExam = async (e) => {
    e.preventDefault();
    try {
      await medicalRecordsApi.savePhysicalExam(encounterId, exam, token);
      toast.success('Examen guardado');
      await load();
    } catch (e) { toast.error('No se pudo guardar'); }
  };

  const addVitals = async (e) => {
    e.preventDefault();
    try {
      await medicalRecordsApi.addVitalSignsForEncounter(encounterId, vitals, token);
      toast.success('Signos registrados');
      await load();
      setVitals({});
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
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/95 backdrop-blur p-6 shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold">Consulta N° {encounterId}</div>
          <button onClick={onClose} className="ml-auto p-1 rounded hover:bg-black/5"><X className="w-4 h-4 text-slate-500" /></button>
        </div>

        {loading ? <div className="p-6 text-sm text-slate-500">Cargando...</div> : (
          encounter ? (
            <div className="mt-3 space-y-4 max-h-[78vh] overflow-y-auto pr-1">
              <div className="flex gap-2">
                {tabs.map(t => (
                  <button key={t.key} className={`px-3 py-1.5 rounded-full text-sm transition ${tab === t.key ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => setTab(t.key)}>{t.label}</button>
                ))}
              </div>

              {tab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border rounded-xl p-4">
                    <div className="font-medium text-slate-900">Datos</div>
                    <div className="text-sm text-slate-600 mt-2">Especialidad: {encounter.specialty_name}</div>
                    <div className="text-sm text-slate-600">Médico: {encounter.doctor_name}</div>
                    <div className="text-sm text-slate-600">Fecha: {new Date(encounter.encounter_date).toLocaleString()}</div>
                    {encounter.chief_complaint && (<div className="text-sm text-slate-700 mt-2"><span className="font-medium">Motivo:</span> {encounter.chief_complaint}</div>)}
                    {encounter.present_illness && (<div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap"><span className="font-medium">Enf. actual:</span> {encounter.present_illness}</div>)}
                  </div>

                    <div className="border rounded-xl p-4">
                    <div className="font-medium text-slate-900">Diagnósticos</div>
                    <ul className="mt-2 space-y-2">
                      {encounter.diagnoses?.length ? encounter.diagnoses.map(d => (
                        <li key={d.id} className="text-sm text-slate-700 flex items-center justify-between bg-slate-50 rounded-lg p-2">
                          <div>
                            <div className="font-medium">{d.diagnosis_description}</div>
                            <div className="text-xs text-slate-500">{d.diagnosis_type}</div>
                          </div>
                          <button className="text-xs text-red-600 hover:underline" onClick={() => deleteDiagnosis(d.id)}>Eliminar</button>
                        </li>
                      )) : <div className="text-sm text-gray-500">Sin diagnósticos</div>}
                    </ul>
                  </div>
                </div>
              )}

              {tab === 'exam' && (
                <form onSubmit={saveExam} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['vitals_summary','general_appearance','head_neck','chest_lungs','cardiovascular','abdomen','extremities','neurological','skin','specialty_specific_exam','notes'].map(k => (
                    <div key={k} className={k==='notes' ? 'md:col-span-2' : ''}>
                      <label className="text-sm text-slate-600">{labelForExamField(k)}</label>
                      <textarea
                        rows={k==='notes'?4:3}
                        className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                        placeholder={placeholderForExamField(k)}
                        value={exam?.[k] || ''}
                        onChange={(e)=>setExam({...exam,[k]:e.target.value})}
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700">Guardar</button>
                  </div>
                </form>
              )}

              {tab === 'vitals' && (
                <form onSubmit={addVitals} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    ['systolic_bp','PA sistólica','mmHg','1'],
                    ['diastolic_bp','PA diastólica','mmHg','1'],
                    ['heart_rate','Pulso','lpm','1'],
                    ['respiratory_rate','Frecuencia respiratoria','rpm','1'],
                    ['temperature','Temperatura','°C','0.1'],
                    ['oxygen_saturation','Sat. de oxígeno','%','1'],
                    ['weight','Peso','kg','0.1'],
                    ['height','Talla','m','0.01'],
                  ].map(([k, lbl, unit, step]) => (
                    <div key={k}>
                      <label className="text-sm text-slate-600">{lbl}</label>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          step={step}
                          className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 pr-14 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                          placeholder={`Ej.: ${k==='temperature'?'36.8':k==='oxygen_saturation'?'98':k==='heart_rate'?'72':k==='respiratory_rate'?'16':k==='systolic_bp'?'120':k==='diastolic_bp'?'80':k==='weight'?'70':k==='height'?'1.70':''}`}
                          value={vitals?.[k] || ''}
                          onChange={(e)=>setVitals({...vitals,[k]:e.target.value})}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{unit}</span>
                      </div>
                    </div>
                  ))}
                  <div className="col-span-2 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-600">Notas</label>
                      <input
                        className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                        placeholder="Ej.: Medición en reposo, brazo derecho."
                        value={vitals?.notes || ''}
                        onChange={(e)=>setVitals({...vitals,notes:e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">IMC (auto)</label>
                      <input
                        className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
                        value={bmiPreview}
                        placeholder="—"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-3 flex justify-end">
                    <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700">Registrar</button>
                  </div>
                </form>
              )}

              {tab === 'diagnoses' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <form onSubmit={addDiagnosis} className="border rounded-xl p-4">
                    <div className="font-medium mb-2 text-slate-900">Añadir diagnóstico</div>
                    <div>
                      <label className="text-sm text-slate-600">Descripción</label>
                      <input className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" placeholder="Ej.: Gastroenteritis aguda" value={diag.diagnosis_description} onChange={(e)=>setDiag({...diag, diagnosis_description:e.target.value})} required />
                    </div>
                    <div className="mt-2">
                      <label className="text-sm text-slate-600">Tipo</label>
                      <div className="mt-1 flex gap-2">
                        {['principal','secundario'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setDiag({...diag, diagnosis_type: t})}
                            className={`rounded-full px-3 py-1.5 text-sm transition ${diag.diagnosis_type===t ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                          >
                            {t.charAt(0).toUpperCase()+t.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-sm text-slate-600">Notas</label>
                      <input className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" placeholder="Contexto adicional, criterios usados, etc." value={diag.notes} onChange={(e)=>setDiag({...diag, notes:e.target.value})} />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700">Añadir</button>
                    </div>
                  </form>

                  <div className="border rounded-xl p-4">
                    <div className="font-medium mb-2 text-slate-900">Diagnósticos del encuentro</div>
                    <ul className="space-y-2">
                      {encounter.diagnoses?.length ? encounter.diagnoses.map(d => (
                        <li key={d.id} className="text-sm text-slate-700 flex items-center justify-between bg-slate-50 rounded-lg p-2">
                          <div>
                            <div className="font-medium">{d.diagnosis_description}</div>
                            <div className="text-xs text-slate-500">{d.diagnosis_type}</div>
                          </div>
                          <button className="text-xs text-red-600 hover:underline" onClick={() => deleteDiagnosis(d.id)}>Eliminar</button>
                        </li>
                      )) : <div className="text-sm text-gray-500">Sin diagnósticos</div>}
                    </ul>
                  </div>
                </div>
              )}

              {tab === 'plans' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <form onSubmit={addPlan} className="border rounded-xl p-4">
                    <div className="font-medium mb-2 text-slate-900">Añadir tratamiento/plan</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-slate-600">Tipo</label>
                        <select className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={plan.plan_type} onChange={(e)=>setPlan({...plan, plan_type:e.target.value})}>
                          <option>Receta</option>
                          <option>Reposo</option>
                          <option>Indicaciones</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-600">Estado</label>
                        <select className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={plan.status} onChange={(e)=>setPlan({...plan, status:e.target.value})}>
                          <option value="active">Activo</option>
                          <option value="completed">Completado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-sm text-slate-600">Descripción</label>
                      <textarea rows={3} className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" placeholder="Detalle del plan: fármacos, dosis, duración o indicaciones específicas." value={plan.description} onChange={(e)=>setPlan({...plan, description:e.target.value})} />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700">Añadir</button>
                    </div>
                  </form>

                  <div className="border rounded-xl p-4">
                    <div className="font-medium mb-2 text-slate-900">Planes/Tratamientos</div>
                    <ul className="space-y-2">
                      {encounter.treatment_plans?.length ? encounter.treatment_plans.map(p => (
                        <li key={p.id} className="text-sm text-slate-700 flex items-center justify-between bg-slate-50 rounded-lg p-2">
                          <div>
                            <div className="font-medium">{p.plan_type}: {p.description}</div>
                            <div className="text-xs text-slate-500">{p.status}</div>
                          </div>
                          <button className="text-xs text-red-600 hover:underline" onClick={() => deletePlan(p.id)}>Eliminar</button>
                        </li>
                      )) : <div className="text-sm text-gray-500">Sin planes</div>}
                    </ul>
                  </div>
                </div>
              )}

              {tab === 'notes' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <form onSubmit={addNote} className="border rounded-xl p-4">
                    <div className="font-medium mb-2 text-slate-900">Añadir nota de progreso</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-slate-600">Tipo</label>
                        <select className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={note.note_type} onChange={(e)=>setNote({...note, note_type:e.target.value})}>
                          <option>Evolución</option>
                          <option>Epicrisis</option>
                          <option>Indicación</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-sm text-slate-600">Contenido</label>
                      <textarea rows={4} className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" placeholder="Hallazgos, evolución clínica, indicaciones o decisiones tomadas." value={note.note_content} onChange={(e)=>setNote({...note, note_content:e.target.value})} required />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700">Añadir</button>
                    </div>
                  </form>

                  <div className="border rounded-xl p-4">
                    <div className="font-medium mb-2 text-slate-900">Notas</div>
                    <ul className="space-y-2">
                      {encounter.progress_notes?.length ? encounter.progress_notes.map(n => (
                        <li key={n.id} className="text-sm text-slate-700 bg-slate-50 rounded-lg p-2">
                          <div className="text-xs text-slate-500">{new Date(n.created_at).toLocaleString()} · {n.author_name} · {n.note_type}</div>
                          <div className="mt-1 whitespace-pre-wrap">{n.note_content}</div>
                        </li>
                      )) : <div className="text-sm text-gray-500">Sin notas</div>}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (<div className="p-6 text-sm text-slate-500">No encontrado</div>)
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
