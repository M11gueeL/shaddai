// src/components/reception/appointments/SpecialtySelector.jsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

const SpecialtySelector = ({ specialties, value, onChange, error, disabled }) => {
  console.log('SpecialtySelector received specialties:', specialties); // 👈 DEBUG

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all text-sm text-gray-800 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-200'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-gray-50 hover:bg-gray-100'}`}
      >
        <option value="">
          {disabled ? 'Primero seleccione un médico' : 'Seleccionar especialidad...'}
        </option>
        {/* 👈 VERIFICAR QUE specialties EXISTE Y ES ARRAY */}
        {specialties && Array.isArray(specialties) && specialties.map((specialty) => (
          <option key={specialty.id} value={specialty.id}>
            {specialty.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      
      {/* 👈 MOSTRAR INFO DE DEBUG */}
      {!disabled && (
        <div className="text-xs text-gray-400 mt-1">
          {specialties && Array.isArray(specialties) 
            ? `${specialties.length} especialidades disponibles`
            : 'Sin especialidades cargadas'
          }
        </div>
      )}
    </div>
  );
};

export default SpecialtySelector;
