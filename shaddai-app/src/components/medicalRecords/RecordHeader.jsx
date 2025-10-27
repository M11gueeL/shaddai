import React from 'react';
import { FilePlus2, Stethoscope, User2 } from 'lucide-react';

export default function RecordHeader({ record, onNewEncounter, onNewReport }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
          <User2 className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-gray-900">{record?.patient_name}</div>
          <div className="text-sm text-gray-600">C.I: {record?.patient_cedula} · HC #{record?.record_number || record?.id}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onNewEncounter} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Stethoscope className="w-4 h-4" />
            Nueva consulta
          </button>
          <button onClick={onNewReport} className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
            <FilePlus2 className="w-4 h-4" />
            Nuevo informe
          </button>
        </div>
      </div>
    </div>
  );
}
