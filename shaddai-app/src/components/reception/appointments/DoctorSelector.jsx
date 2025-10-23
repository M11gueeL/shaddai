import React, { useState, useEffect } from 'react';
import { Stethoscope, ChevronDown, X } from 'lucide-react';
import usersAPI from './../../../api/userApi';

const DoctorSelector = ({ onSelect, error, selectedDoctor }) => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Llamada al endpoint de médicos (el token se pasa si es necesario)
      const response = await usersAPI.getDoctors(token);
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    try {
      // Normalizar especialidades para evitar undefined
      const doctorWithSpecialties = {
        ...doctor,
        specialties: doctor.specialties || []
      };
      onSelect(doctorWithSpecialties);
      setIsOpen(false);
    } catch (error) {
      console.error('Error selecting doctor:', error);
      onSelect({ ...doctor, specialties: [] });
      setIsOpen(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation(); // 👈 EVITAR PROPAGACIÓN
    onSelect(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* 👈 CAMBIAR A DIV EN LUGAR DE BUTTON PRINCIPAL */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between cursor-pointer ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <div className="flex items-center flex-1">
          <Stethoscope className="w-4 h-4 text-gray-400 mr-2" />
          <span className={selectedDoctor ? 'text-gray-900' : 'text-gray-500'}>
            {selectedDoctor 
              ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`
              : 'Seleccionar médico...'
            }
          </span>
        </div>
        <div className="flex items-center">
          {selectedDoctor && (
            <button
              type="button"
              onClick={handleClear}
              className="mr-2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Cargando médicos...</p>
            </div>
          ) : doctors.length > 0 ? (
            doctors.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                onClick={() => handleDoctorSelect(doctor)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
              >
                <div className="font-medium text-gray-900">
                  Dr. {doctor.first_name} {doctor.last_name}
                </div>
                <div className="text-sm text-gray-500">
                  Cédula: {doctor.cedula} | Especialidades: {doctor.specialties?.length || 0}
                </div>
                <div className="text-xs text-gray-400">
                  {(doctor.specialties?.map(s => s.name) || []).join(', ') || 'Sin especialidades'}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No hay médicos disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorSelector;
