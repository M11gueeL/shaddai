import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, Loader2, Mail, CreditCard, Hash, Phone } from 'lucide-react';
import PatientsApi from '../../api/PatientsApi';
import { useAuth } from '../../context/AuthContext';

export default function SearchPatientBar({ onSearchByCedula, onSearchByPatientId, loading }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const containerRef = useRef(null);

  // Cargar todos los pacientes al enfocar si no se han cargado
  const loadPatients = async () => {
    if (hasLoaded) return;
    
    setIsLoadingPatients(true);
    try {
      const res = await PatientsApi.getAll(token);
      if (res.data && Array.isArray(res.data)) {
        setAllPatients(res.data);
        setFilteredPatients(res.data);
        setHasLoaded(true);
      }
    } catch (error) {
      console.error("Error loading patients", error);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    loadPatients();
  };

  // Filtrado dinámico
  useEffect(() => {
    if (!hasLoaded) return;

    if (!query.trim()) {
      setFilteredPatients(allPatients);
      return;
    }

    const lowerQ = query.toLowerCase();
    const filtered = allPatients.filter(p => {
      const name = p.full_name?.toLowerCase() || '';
      const cedula = p.cedula?.toLowerCase() || '';
      const email = p.email?.toLowerCase() || '';
      const phone = p.phone?.toLowerCase() || '';
      const id = String(p.id);

      return name.includes(lowerQ) || 
             cedula.includes(lowerQ) || 
             email.includes(lowerQ) || 
             phone.includes(lowerQ) ||
             id.includes(lowerQ);
    });

    setFilteredPatients(filtered);
  }, [query, allPatients, hasLoaded]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (patient) => {
    if (onSearchByPatientId) {
        onSearchByPatientId(patient.id);
    } else if (onSearchByCedula && patient.cedula) {
        onSearchByCedula(patient.cedula);
    }
    setIsOpen(false);
    setQuery(''); 
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={containerRef}>
      <div className={`relative group transition-all duration-300 ${isOpen ? 'scale-[1.02]' : ''}`}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
          )}
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-10 py-4 bg-white border-0 ring-1 ring-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:shadow-lg transition-all duration-300 ease-out text-base"
          placeholder="Buscar paciente por nombre, cédula, teléfono o email.."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <div className={`absolute left-0 right-0 mt-2 w-full bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden origin-top transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`}>
          {isLoadingPatients ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium">Cargando directorio de pacientes...</p>
            </div>
          ) : filteredPatients.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50 sticky top-0 backdrop-blur-sm">
                Resultados ({filteredPatients.length})
              </div>
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50/50 transition-colors duration-200 border-b border-gray-50 last:border-0 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                        {patient.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {patient.full_name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                            <CreditCard className="h-3 w-3" />
                            {patient.cedula || 'S/C'}
                          </span>
                          {patient.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </span>
                          )}
                          {patient.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="flex items-center gap-1 text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        <Hash className="h-3 w-3" />
                        {patient.id}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <User className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="font-medium">No se encontraron pacientes</p>
              <p className="text-sm text-gray-400 mt-1">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
    </div>
  );
}
