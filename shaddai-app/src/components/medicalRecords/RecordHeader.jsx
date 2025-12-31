import React, { useEffect, useMemo, useState } from 'react';
import { FilePlus2, Stethoscope, User2, Calendar, Phone, Mail, MapPin, IdCard, Edit2 } from 'lucide-react';
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
    <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        
        {/* Patient Identity */}
        <div className="flex items-start gap-5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-100 to-slate-100 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm border border-slate-100">
              {initials ? <span className="text-xl font-bold tracking-tight">{initials}</span> : <User2 className="h-8 w-8" />}
            </div>
          </div>
          
          <div className="pt-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                {patient?.full_name || record?.patient_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
                <IdCard className="h-3.5 w-3.5 text-slate-400" /> 
                {patient?.cedula || record?.patient_cedula}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">HC #{record?.record_number || record?.id}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap md:justify-end">
          {onEditPatient && (
            <button 
                onClick={() => onEditPatient(patient?.id || record?.patient_id)} 
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95"
            >
              <Edit2 className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              <span className="hidden sm:inline">Editar</span>
            </button>
          )}
          <button 
            onClick={onNewReport} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium shadow-lg shadow-slate-200 hover:bg-slate-900 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Informe</span>
          </button>
          <button 
            onClick={onNewEncounter} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            <Stethoscope className="h-4 w-4" />
            <span>Nueva Consulta</span>
          </button>
        </div>
      </div>

      {/* Patient Details Grid */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <InfoChip icon={Calendar} label="Edad" value={age != null ? `${age} años` : null} />
        <InfoChip icon={Calendar} label="Nacimiento" value={patient?.birth_date ? new Date(patient.birth_date).toLocaleDateString() : null} />
        <InfoChip icon={User2} label="Sexo" value={patient?.gender} />
        <InfoChip icon={Phone} label="Teléfono" value={patient?.phone} />
        <InfoChip icon={Mail} label="Email" value={patient?.email} />
        <InfoChip icon={MapPin} label="Dirección" value={patient?.address} />
      </div>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="group flex flex-col gap-1 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200 border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-700 truncate pl-5.5">
        {value || <span className="text-slate-300 font-normal italic">No registrado</span>}
      </div>
    </div>
  );
}
