import React, { useEffect, useMemo, useState } from 'react';
import { FilePlus2, Stethoscope, User2, Calendar, Phone, Mail, MapPin, IdCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PatientsApi from '../../api/PatientsApi';

export default function RecordHeader({ record, onNewEncounter, onNewReport, onEditPatient, refreshKey }) {
  const { token } = useAuth();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (record?.patient_id) {
          const res = await PatientsApi.getById(record.patient_id, token);
          if (!cancelled) setPatient(res.data);
        } else {
          // Fallback: build from record when full patient not available
          setPatient({
            id: record?.patient_id,
            full_name: record?.patient_name,
            cedula: record?.patient_cedula,
          });
        }
      } catch {
        setPatient({
          id: record?.patient_id,
          full_name: record?.patient_name,
          cedula: record?.patient_cedula,
        });
      }
    })();
    return () => { cancelled = true; };
  }, [record?.patient_id, record?.patient_name, record?.patient_cedula, token, refreshKey]);

  const age = useMemo(() => {
    const dob = patient?.birth_date;
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth)) return null;
    const today = new Date();
    let a = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
    return a;
  }, [patient?.birth_date]);

  const initials = useMemo(() => {
    const name = (patient?.full_name || record?.patient_name || '').trim();
    if (!name) return '';
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase()).join('');
  }, [patient?.full_name, record?.patient_name]);

  return (
    <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">
            {initials ? <span className="font-semibold">{initials}</span> : <User2 className="h-6 w-6" />}
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold text-slate-900">{patient?.full_name || record?.patient_name}</div>
            <div className="text-sm text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1"><IdCard className="h-3.5 w-3.5" /> C.I: {patient?.cedula || record?.patient_cedula}</span>
              <span>HC #{record?.record_number || record?.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onEditPatient && (
            <button onClick={() => onEditPatient(patient?.id || record?.patient_id)} className="w-full sm:w-auto justify-center flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 shadow-sm hover:bg-slate-50">
              Editar paciente
            </button>
          )}
          <button onClick={onNewEncounter} className="w-full sm:w-auto justify-center flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white shadow hover:bg-blue-700">
            <Stethoscope className="h-4 w-4" />
            Nueva consulta
          </button>
          <button onClick={onNewReport} className="w-full sm:w-auto justify-center flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-white shadow hover:bg-slate-900">
            <FilePlus2 className="h-4 w-4" />
            Nuevo informe
          </button>
        </div>
      </div>

      {/* Ficha del paciente */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <InfoChip icon={Calendar} label="Edad" value={age != null ? `${age} años` : '—'} />
        <InfoChip icon={Calendar} label="Nacimiento" value={patient?.birth_date ? new Date(patient.birth_date).toLocaleDateString() : '—'} />
        <InfoChip icon={User2} label="Sexo" value={patient?.gender || '—'} />
        <InfoChip icon={Phone} label="Teléfono" value={patient?.phone || '—'} />
        <InfoChip icon={Mail} label="Email" value={patient?.email || '—'} />
        <InfoChip icon={MapPin} label="Dirección" value={patient?.address || '—'} />
        <InfoChip icon={User2} label="Estado civil" value={patient?.marital_status || '—'} />
        <InfoChip icon={IdCard} label="Paciente ID" value={patient?.id || record?.patient_id || '—'} />
      </div>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-0.5 truncate text-sm text-slate-800">{value || '—'}</div>
    </div>
  );
}
