import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, Loader2, Mail, CreditCard, Hash, Phone, ChevronRight } from 'lucide-react';
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
    <div className="relative w-full max-w-3xl mx-auto z-50" ref={containerRef}>
      <div className={`relative group transition-all duration-500 ease-out ${isOpen ? 'scale-[1.01]' : ''}`}>
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <Search className={`h-5 w-5 transition-colors duration-300 ${isOpen ? 'text-blue-500' : 'text-slate-400'}`} />
          )}
        </div>
        <input
          type="text"
          className={`
            block w-full pl-12 pr-12 py-4 
            bg-white border-0
            text-slate-700 placeholder:text-slate-400
            shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
            rounded-2xl
            focus:ring-2 focus:ring-blue-500/10 focus:shadow-[0_8px_30px_rgb(0,0,0,0.08)]
            transition-all duration-300 ease-out
            text-base font-medium
          `}
          placeholder="Buscar paciente por nombre, cédula, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <div className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
            </div>
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute mt-3 w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          
          {isLoadingPatients && !hasLoaded && (
            <div className="p-8 text-center text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium">Cargando directorio de pacientes...</p>
            </div>
          )}

          {!isLoadingPatients && filteredPatients.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">No se encontraron pacientes</p>
              <p className="text-slate-400 text-sm mt-1">Intenta con otro término de búsqueda</p>
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-2">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handleSelect(patient)}
                className="w-full px-4 py-3 flex items-center gap-4 hover:bg-blue-50/50 transition-colors duration-200 group border-b border-slate-50 last:border-0"
              >
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-semibold shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {patient.full_name?.charAt(0).toUpperCase()}
                    </div>
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                    {patient.full_name}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    {patient.cedula && (
                        <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" /> {patient.cedula}
                        </span>
                    )}
                    {patient.phone && (
                        <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {patient.phone}
                        </span>
                    )}
                  </div>
                </div>

                <div className="text-slate-300 group-hover:text-blue-400 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                </div>
              </button>
            ))}
          </div>
          
          <div className="bg-slate-50/80 px-4 py-2 text-xs text-slate-400 border-t border-slate-100 flex justify-between items-center">
            <span>{filteredPatients.length} pacientes encontrados</span>
            <span className="hidden sm:inline">Presiona ESC para cerrar</span>
          </div>
        </div>
      )}
    </div>
  );
}
