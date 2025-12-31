import React, { useEffect, useMemo, useState } from 'react';
import { X, ChevronDown, Stethoscope, FileText, AlertCircle } from 'lucide-react';
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
    if (!form.specialty_id) { toast.error('Seleccione especialidad'); return; }
    if (!form.chief_complaint) { toast.error('Ingrese motivo de consulta'); return; }

    try {
      const payload = { ...form };
      if (!isAdmin) payload.doctor_id = defaultDoctorId;
      const res = await medicalRecordsApi.createEncounter(payload, token);
      toast.success('Consulta creada');
      onCreated?.(res.data?.encounter);
      onClose();
    } catch (e) {
      const msg = e?.response?.data?.error || 'No se pudo crear el encuentro';
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-50 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <Stethoscope className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Nueva Consulta</h3>
                <p className="text-xs text-slate-500 font-medium">Registre los detalles iniciales del encuentro</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {isAdmin && (
            <div className="relative">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Doctor</label>
              <select
                className="w-full appearance-none rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                value={form.doctor_id}
                onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                required
              >
                <option value="">Seleccione doctor</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-[2.4rem] h-4 w-4 text-slate-400" />
            </div>
          )}

          <div className="relative">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Especialidad</label>
            <select
              className="w-full appearance-none rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              value={form.specialty_id}
              onChange={(e) => setForm({ ...form, specialty_id: e.target.value })}
              required
            >
              <option value="">Seleccione especialidad</option>
              {doctorSpecialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-[2.4rem] h-4 w-4 text-slate-400" />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tipo de encuentro</label>
            <div className="flex flex-wrap gap-2">
              {['Primera vez','Consulta', 'Control', 'Emergencia'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, encounter_type: t })}
                  className={`
                    rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 border
                    ${form.encounter_type === t 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
            <FirstTimeSuggestion record={record} doctorId={isAdmin ? form.doctor_id : defaultDoctorId} specialtyId={form.specialty_id} onUse={() => setForm({ ...form, encounter_type: 'Primera vez' })} />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Motivo de consulta</label>
            <div className="relative">
                <div className="absolute top-3 left-4 text-slate-400">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <input
                className="w-full rounded-xl border-0 bg-slate-50 pl-12 pr-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400"
                placeholder="Ej.: Dolor torácico de 2 horas de evolución"
                value={form.chief_complaint}
                onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })}
                />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Enfermedad actual</label>
            <div className="relative">
                <div className="absolute top-3 left-4 text-slate-400">
                    <FileText className="w-5 h-5" />
                </div>
                <textarea
                className="w-full rounded-xl border-0 bg-slate-50 pl-12 pr-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400 min-h-[120px] resize-none"
                placeholder="Historia cronológica, síntomas asociados, factores desencadenantes y tratamientos previos."
                value={form.present_illness}
                onChange={(e) => setForm({ ...form, present_illness: e.target.value })}
                />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-slate-50">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
                Cancelar
            </button>
            <button 
                type="submit" 
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            >
                Crear Consulta
            </button>
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
    <div className="mt-3 flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-1">
      <span className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-amber-700 font-medium border border-amber-100">
        💡 Sugerencia: Parece ser la primera vez con este especialista.
      </span>
      <button type="button" onClick={onUse} className="font-semibold text-amber-700 hover:text-amber-800 hover:underline decoration-amber-300 underline-offset-2">
        Usar “Primera vez”
      </button>
    </div>
  );
}
