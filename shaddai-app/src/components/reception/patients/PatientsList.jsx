import { useState, useEffect } from 'react';
import PatientsApi from '../../../api/PatientsApi';
import PatientDetail from './PatientDetail';
import { FiFilter, FiSearch } from 'react-icons/fi';

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
    <div className="bg-white h-full flex flex-col">
      {/* Header del Modal */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Pacientes</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition duration-300 text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1 flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar pacientes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="appearance-none w-full border border-l-0 border-gray-300 rounded-r-lg pl-3 pr-8 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="all">Todos los campos</option>
                <option value="id">ID</option>
                <option value="name">Nombre</option>
                <option value="cedula">Cédula</option>
                <option value="email">Email</option>
                <option value="phone">Teléfono</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <FiFilter className="text-gray-500" />
              Filtros
            </button>
            {(filters.hasPhone || filters.hasEmail) && (
              <button
                onClick={() => setFilters({ hasPhone: false, hasEmail: false })}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={filters.hasPhone}
                    onChange={(e) => setFilters((prev) => ({ ...prev, hasPhone: e.target.checked }))}
                  />
                  <span className="ml-2 text-sm text-gray-700">Solo con teléfono</span>
                </label>
              </div>
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={filters.hasEmail}
                    onChange={(e) => setFilters((prev) => ({ ...prev, hasEmail: e.target.checked }))}
                  />
                  <span className="ml-2 text-sm text-gray-700">Solo con email</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido del Modal */}
      <div className="flex-1 p-6 overflow-y-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando pacientes...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 text-lg">No hay pacientes registrados.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombres
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cédula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.cedula}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewPatient(patient.id)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition duration-300 flex items-center space-x-2 font-medium"
                      >
                        <span>Más Información</span>
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