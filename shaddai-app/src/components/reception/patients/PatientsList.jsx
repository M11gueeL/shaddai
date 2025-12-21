import { useState, useEffect } from 'react';
import PatientsApi from '../../../api/PatientsApi';
import PatientDetail from './PatientDetail';
import { Search, Filter, X, Users, Eye, ChevronRight, UserPlus, FileText } from 'lucide-react';

export default function PatientList({ onClose }) {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [filters, setFilters] = useState({
    hasPhone: false,
    hasEmail: false,
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await PatientsApi.getAll(token);
      const data = response?.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.patients)
            ? data.patients
            : [];
      setPatients(list);
    } catch (err) {
      setError('Error al cargar los pacientes: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await PatientsApi.getById(patientId, token);
      setSelectedPatient(response.data);
      setShowDetail(true);
    } catch (err) {
      setError('Error al cargar los detalles del paciente');
    }
  };

  const handlePatientUpdated = () => {
    setShowDetail(false);
    setSelectedPatient(null);
    fetchPatients(); // Refrescar la lista
  };

  // Filtrado y búsqueda avanzada (similar a UserTable)
  useEffect(() => {
    let result = patients || [];

    // Búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (searchField !== 'all') {
        result = result.filter((p) => {
          switch (searchField) {
            case 'id':
              return String(p.id || '').toLowerCase().includes(term);
            case 'name':
              return (
                (p.full_name && p.full_name.toLowerCase().includes(term)) ||
                ((p.first_name || '') + ' ' + (p.last_name || '')).toLowerCase().includes(term)
              );
            case 'cedula':
              return (p.cedula || '').toLowerCase().includes(term);
            case 'email':
              return (p.email || '').toLowerCase().includes(term);
            case 'phone':
              return (p.phone || '').toLowerCase().includes(term);
            default:
              return true;
          }
        });
      } else {
        result = result.filter((p) =>
          (p.full_name && p.full_name.toLowerCase().includes(term)) ||
          ((p.first_name || '') + ' ' + (p.last_name || '')).toLowerCase().includes(term) ||
          (p.email && p.email.toLowerCase().includes(term)) ||
          (p.cedula && p.cedula.toLowerCase().includes(term)) ||
          (p.phone && p.phone.toLowerCase().includes(term)) ||
          (p.id && String(p.id).toLowerCase().includes(term))
        );
      }
    }

    // Filtros
    if (filters.hasPhone) {
      result = result.filter((p) => !!(p.phone && String(p.phone).trim()));
    }
    if (filters.hasEmail) {
      result = result.filter((p) => !!(p.email && String(p.email).trim()));
    }

    setFilteredPatients(result);
  }, [patients, searchTerm, searchField, filters]);

  if (showDetail && selectedPatient) {
    return (
      <PatientDetail
        patient={selectedPatient}
        onClose={() => {
          setShowDetail(false);
          setSelectedPatient(null);
        }}
        onPatientUpdated={handlePatientUpdated}
      />
    );
  }

  return (
    <div className="bg-white h-full flex flex-col animate-in fade-in duration-300">
      {/* Header del Modal */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">Directorio de Pacientes</h2>
                <p className="text-sm text-gray-500">Gestiona y consulta la información de tus pacientes</p>
            </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="bg-white p-6 border-b border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 flex shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, cédula, email..."
                className="w-full pl-10 pr-4 py-2.5 border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative border-l border-gray-200 bg-gray-50">
              <select
                className="appearance-none h-full pl-4 pr-10 py-2 bg-transparent text-sm font-medium text-gray-600 focus:ring-0 border-none cursor-pointer hover:text-gray-900"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="id">ID</option>
                <option value="name">Nombre</option>
                <option value="cedula">Cédula</option>
                <option value="email">Email</option>
                <option value="phone">Teléfono</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'}`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            {(filters.hasPhone || filters.hasEmail) && (
              <button
                onClick={() => setFilters({ hasPhone: false, hasEmail: false })}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 hover:bg-red-100 transition-all text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-blue-500 checked:bg-blue-500"
                        checked={filters.hasPhone}
                        onChange={(e) => setFilters((prev) => ({ ...prev, hasPhone: e.target.checked }))}
                    />
                    <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Solo con teléfono</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-blue-500 checked:bg-blue-500"
                        checked={filters.hasEmail}
                        onChange={(e) => setFilters((prev) => ({ ...prev, hasEmail: e.target.checked }))}
                    />
                    <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Solo con email</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Contenido del Modal */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
                <X className="w-4 h-4" />
            </div>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-500 font-medium">Cargando pacientes...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-gray-100 rounded-full mb-4">
                <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No se encontraron pacientes</h3>
            <p className="text-gray-500 max-w-xs mx-auto">Intenta ajustar los filtros o realiza una nueva búsqueda.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cédula</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-500">#{patient.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {patient.full_name?.charAt(0) || 'P'}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{patient.full_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-md inline-block">{patient.cedula}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-900">{patient.phone || '-'}</span>
                        <span className="text-xs text-gray-500">{patient.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleViewPatient(patient.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm text-sm font-medium group/btn"
                      >
                        <Eye className="w-4 h-4 text-gray-400 group-hover/btn:text-blue-600 transition-colors" />
                        Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}