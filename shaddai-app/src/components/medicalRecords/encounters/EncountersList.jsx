import React, { useEffect, useState } from 'react';
import { CalendarDays, ClipboardList, Plus } from 'lucide-react';
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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-800 font-medium">
          <ClipboardList className="w-4 h-4" />
          Historial de consultas médicas
        </div>
        {allowCreate && (
          <button onClick={onCreate} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        )}
      </div>
      <div className="divide-y">
        {items?.length ? items.map((e) => (
          <button key={e.id} onClick={() => onOpenEncounter?.(e.id)} className="w-full text-left px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 text-gray-700"><CalendarDays className="w-4 h-4" /></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{e.specialty_name} · {e.encounter_type || 'Consulta'} · {new Date(e.encounter_date).toLocaleString()}</div>
                <div className="text-xs text-gray-600">Dr(a). {e.doctor_name}</div>
              </div>
            </div>
          </button>
        )) : (
          <div className="px-4 py-6 text-sm text-gray-500">Sin encuentros aún.</div>
        )}
      </div>
    </div>
  );
}
