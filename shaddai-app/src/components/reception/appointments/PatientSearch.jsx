import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X } from 'lucide-react';
import patientsAPI from './../../../api/PatientsApi';

const PatientSearch = ({
  onSelect,
  error,
  selectedPatient,
  onAddNew,
  noResultsMessage = 'No se encontraron pacientes con ese criterio.',
  addNewLabel = '+ Registrar Nuevo'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Búsqueda de pacientes
  const searchPatients = async (term) => {
    if (term.length < 3) {
      setPatients([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await patientsAPI.getAll(token);
      const lowerTerm = term.toLowerCase();
      const filtered = response.data.filter(patient => 
        (patient.full_name && patient.full_name.toLowerCase().includes(lowerTerm)) ||
        (patient.cedula && patient.cedula.toLowerCase().includes(lowerTerm)) ||
        (patient.representative_name && patient.representative_name.toLowerCase().includes(lowerTerm)) ||
        (patient.representative_cedula && patient.representative_cedula.toLowerCase().includes(lowerTerm)) ||
        (patient.billing_cedula && patient.billing_cedula.toLowerCase().includes(lowerTerm))
      );
      setPatients(filtered);
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar por cédula (paciente o representante)
  const searchByCedula = async (cedula) => {
    if (cedula.length < 5) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const lowerCedula = cedula.toLowerCase();
      const response = await patientsAPI.getAll(token);
      const filtered = response.data.filter(patient =>
        (patient.cedula && patient.cedula.toLowerCase().includes(lowerCedula)) ||
        (patient.representative_cedula && patient.representative_cedula.toLowerCase().includes(lowerCedula)) ||
        (patient.billing_cedula && patient.billing_cedula.toLowerCase().includes(lowerCedula))
      );
      setPatients(filtered);
    } catch (error) {
      console.error('Error searching by cedula:', error);
      setPatients([]); // Limpiar resultados en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en el input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);

    // Si parece una cédula (solo números y espacios), buscar por cédula
    if (/^[\d ]+$/.test(value)) {
      searchByCedula(value);
    } else {
      searchPatients(value);
    }
  };

  // Seleccionar paciente
  const handlePatientSelect = (patient) => {
    onSelect(patient);
    setSearchTerm(patient.cedula ? `${patient.cedula} - ${patient.full_name}` : patient.full_name);
    setShowDropdown(false);
    setPatients([]);
  };

  // Limpiar selección
  const handleClear = () => {
    setSearchTerm('');
    onSelect(null);
    setPatients([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (selectedPatient) {
      // Formato visual: Cédula - Nombre 
      const displayText = selectedPatient.cedula 
        ? `${selectedPatient.cedula} - ${selectedPatient.full_name}`
        : selectedPatient.full_name;
        
      setSearchTerm(displayText);
    } else {
      setSearchTerm('');
    }
  }, [selectedPatient]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder="Buscar por cédula (paciente/representante) o nombre..."
          className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400 ${
            error ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        
        {selectedPatient && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && patients.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {patients.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => handlePatientSelect(patient)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
            >
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {patient.full_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Cédula: {patient.cedula || 'Sin cédula'} | Rep: {patient.representative_cedula || 'N/A'} | Teléfono: {patient.phone || 'N/A'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay resultados y botón para agregar rápido */}
      {showDropdown && searchTerm.length >= 3 && patients.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center">
          <p className="text-gray-500 mb-3">{noResultsMessage}</p>
          {onAddNew && (
            <button
              type="button"
              onClick={() => {
                setShowDropdown(false);
                onAddNew(searchTerm);
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              <User className="w-8 h-4" />
              {addNewLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
