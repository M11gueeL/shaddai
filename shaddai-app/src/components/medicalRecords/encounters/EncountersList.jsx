import React, { useEffect, useState } from 'react';
import { CalendarDays, ClipboardList, Plus, ChevronRight, Stethoscope, Clock } from 'lucide-react';
import medicalRecordsApi from '../../../api/medicalRecords';
import { useAuth } from '../../../context/AuthContext';

export default function EncountersList({ recordId, encounters, onOpenEncounter, allowCreate, onCreate }) {
  const { token } = useAuth();
  const [items, setItems] = useState(encounters || []);

  useEffect(() => {
    setItems(encounters || []);
  }, [encounters]);

  useEffect(() => {
    if (!recordId) return;
    (async () => {
      try {
        const res = await medicalRecordsApi.getEncountersForRecord(recordId, token);
        setItems(res.data || []);
      } catch (e) {
        // ignore
      }
    })();
  }, [recordId, token]);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="p-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm">
            <ClipboardList className="w-5 h-5" />
          </div>
          Historial de Consultas
        </div>
        {allowCreate && (
          <button 
            onClick={onCreate} 
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-white text-sm font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" /> 
            <span>Nueva Consulta</span>
          </button>
        )}
      </div>
      
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
      <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
        {items?.length ? items.map((e) => (
          <button 
            key={e.id} 
            onClick={() => onOpenEncounter?.(e.id)} 
            className="w-full text-left px-6 py-5 transition-all duration-200 hover:bg-slate-50 group relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-5">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-white flex flex-col items-center justify-center border border-slate-100 shadow-sm group-hover:border-indigo-100 group-hover:shadow-indigo-100 transition-all">
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 uppercase tracking-wider">
                        {new Date(e.encounter_date).toLocaleString('es-ES', { month: 'short' }).replace('.', '')}
                    </span>
                    <span className="text-xl font-bold text-slate-700 group-hover:text-indigo-700 leading-none mt-0.5">
                        {new Date(e.encounter_date).getDate()}
                    </span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {e.specialty_name || 'Medicina General'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(e.encounter_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <h4 className="text-base font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                    {e.encounter_type || 'Consulta Médica'}
                </h4>
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-500">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dr(a). {e.doctor_name}</span>
                </div>
              </div>

              <div className="text-slate-300 group-hover:text-indigo-400 transition-colors transform group-hover:translate-x-1 duration-200">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        )) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/30">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <ClipboardList className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-medium text-lg">No hay consultas registradas</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                Comience registrando una nueva consulta médica para este paciente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
