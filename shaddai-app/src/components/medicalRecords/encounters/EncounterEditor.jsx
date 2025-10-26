import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
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
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">Nuevo encuentro</div>
          <button onClick={onClose} className="ml-auto p-1 rounded hover:bg-black/5"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isAdmin && (
            <div>
              <label className="text-sm text-gray-600">Médico</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} required>
                <option value="">Seleccione médico</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                ))}
              </select>
            </div>
          )}

          {!isAdmin && (
            <div>
              <label className="text-sm text-gray-600">Médico</label>
              <input className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-50" value={`${user?.first_name || ''} ${user?.last_name || ''}`.trim()} disabled />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-600">Especialidad</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.specialty_id} onChange={(e) => setForm({ ...form, specialty_id: e.target.value })} required>
              <option value="">Seleccione especialidad</option>
              {doctorSpecialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Tipo de encuentro</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.encounter_type} onChange={(e) => setForm({ ...form, encounter_type: e.target.value })}>
              <option>Consulta</option>
              <option>Control</option>
              <option>Emergencia</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Motivo de consulta</label>
            <input className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.chief_complaint} onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })} />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Enfermedad actual</label>
            <textarea className="w-full mt-1 px-3 py-2 border rounded-lg" rows={3} value={form.present_illness} onChange={(e) => setForm({ ...form, present_illness: e.target.value })} />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}
