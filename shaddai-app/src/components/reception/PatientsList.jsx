import { useState, useEffect } from 'react';
import PatientsApi from './../../api/PatientsApi';
import PatientDetail from './PatientDetail';

export default function PatientList({ onClose }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await PatientsApi.getAll(token);
      setPatients(response.data);
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
        ) : patients.length === 0 ? (
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
                {patients.map((patient) => (
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