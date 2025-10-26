import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchPatientBar({ onSearchByCedula, onSearchByPatientId, loading }) {
  const [cedula, setCedula] = useState('');
  const [patientId, setPatientId] = useState('');

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 shadow-sm">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Buscar por cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          onClick={() => onSearchByCedula?.(cedula.trim())}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Buscar
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          className="w-36 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="ID Paciente"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <button
          disabled={loading}
          onClick={() => onSearchByPatientId?.(patientId.trim())}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
        >
          Cargar
        </button>
      </div>
    </div>
  );
}
