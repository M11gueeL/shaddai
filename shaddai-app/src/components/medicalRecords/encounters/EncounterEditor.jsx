import React, { useEffect, useMemo, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import medicalRecordsApi from '../../../api/medicalRecords';
import { useToast } from '../../../context/ToastContext';
import userApi from '../../../api/userApi';

export default function EncounterEditor({ record, token, user, doctors = [], specialties = [], onClose, onCreated }) {
  const toast = useToast();
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes('admin');

  const defaultDoctorId = useMemo(() => {
    if (isAdmin) return '';
    return user?.id || '';
  }, [isAdmin, user]);

  const [form, setForm] = useState({
    patient_id: record?.patient_id,
    doctor_id: defaultDoctorId,
    specialty_id: '',
    encounter_type: 'Consulta',
    chief_complaint: '',
    present_illness: '',
  });
  const [doctorSpecialties, setDoctorSpecialties] = useState([]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, patient_id: record?.patient_id, doctor_id: defaultDoctorId }));
  }, [record?.patient_id, defaultDoctorId]);

  // Load specialties for the selected doctor (admin can change doctor)
  useEffect(() => {
    const load = async () => {
      const doctorId = isAdmin ? form.doctor_id : defaultDoctorId;
      if (!doctorId) { setDoctorSpecialties([]); return; }
      try {
        const res = await userApi.getSpecialtiesByDoctorId(doctorId, token);
        setDoctorSpecialties(res.data || []);
      } catch {
        setDoctorSpecialties([]);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.doctor_id, isAdmin, defaultDoctorId, token]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await medicalRecordsApi.createEncounter(form, token);
      onCreated?.(res.data?.encounter);
    } catch (e) {
      const msg = e?.response?.data?.error || 'No se pudo crear el encuentro';
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-6 shadow-2xl max-h-[85vh] overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">Nueva consulta</div>
          <button onClick={onClose} className="ml-auto p-1 rounded hover:bg-black/5"><X className="w-4 h-4 text-slate-500" /></button>
        </div>

        <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
          {isAdmin ? (
            <div className="relative">
              <label className="text-sm text-slate-600">Médico</label>
              <select
                className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 pr-10 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15 appearance-none"
                value={form.doctor_id}
                onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                required
              >
                <option value="">Seleccione médico</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-8 h-4 w-4 text-slate-400" />
              <p className="mt-1 text-xs text-slate-500">Seleccione el médico responsable del encuentro.</p>
            </div>
          ) : (
            <div>
              <label className="text-sm text-slate-600">Médico</label>
              <input
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
                value={`${user?.first_name || ''} ${user?.last_name || ''}`.trim()}
                disabled
              />
            </div>
          )}

          <div className="relative">
            <label className="text-sm text-slate-600">Especialidad</label>
            <select
              className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 pr-10 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15 appearance-none"
              value={form.specialty_id}
              onChange={(e) => setForm({ ...form, specialty_id: e.target.value })}
              required
            >
              <option value="">Seleccione especialidad</option>
              {doctorSpecialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-8 h-4 w-4 text-slate-400" />
            <p className="mt-1 text-xs text-slate-500">Área de atención en esta consulta.</p>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">Tipo de encuentro</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {['Primera vez','Consulta', 'Control', 'Emergencia'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, encounter_type: t })}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${form.encounter_type === t ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            {/* Sugerencia de primera vez */}
            <FirstTimeSuggestion record={record} doctorId={isAdmin ? form.doctor_id : defaultDoctorId} specialtyId={form.specialty_id} onUse={() => setForm({ ...form, encounter_type: 'Primera vez' })} />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">Motivo de consulta</label>
            <input
              className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
              placeholder="Ej.: Dolor torácico de 2 horas de evolución"
              value={form.chief_complaint}
              onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })}
            />
            <p className="mt-1 text-xs text-slate-500">Una frase breve que resuma el motivo principal.</p>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-slate-600">Enfermedad actual</label>
            <textarea
              className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
              rows={4}
              placeholder="Historia cronológica, síntomas asociados, factores desencadenantes y tratamientos previos."
              value={form.present_illness}
              onChange={(e) => setForm({ ...form, present_illness: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FirstTimeSuggestion({ record, doctorId, specialtyId, onUse }) {
  const [suggest, setSuggest] = useState(false);

  useEffect(() => {
    if (!record?.recent_encounters || !doctorId || !specialtyId) { setSuggest(false); return; }
    const prev = (record.recent_encounters || []).some(e => String(e.doctor_id) === String(doctorId) && String(e.specialty_id) === String(specialtyId));
    setSuggest(!prev);
  }, [record?.recent_encounters, doctorId, specialtyId]);

  if (!suggest) return null;
  return (
    <div className="mt-2 flex items-center gap-2 text-xs">
      <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">Sugerencia: Parece ser la primera vez con este especialista.</span>
      <button type="button" onClick={onUse} className="underline text-amber-700 hover:text-amber-800">Usar “Primera vez”</button>
    </div>
  );
}
