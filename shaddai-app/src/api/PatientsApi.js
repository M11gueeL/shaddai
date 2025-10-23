import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default {

    // Obtener todos los pacientes
    getAll: (token) => axios.get(`${API_URL}/patients/`, getAuthHeaders(token)),

    // Obtener paciente por ID
  getById: (id, token) => axios.get(`${API_URL}/patients/${id}`, getAuthHeaders(token)),

  // Obtener paciente por cédula
  getByCedula: (cedula, token) => axios.get(`${API_URL}/patients/cedula/${cedula}`, getAuthHeaders(token)),
  
  // Crear paciente
  create: (patientData, token) => axios.post(`${API_URL}/patients`, patientData, getAuthHeaders(token)),
  
  // Actualizar paciente
  update: (id, patientData, token) => axios.put(`${API_URL}/patients/${id}`, patientData, getAuthHeaders(token)),
  
  // Eliminar paciente
  delete: (id, token) => axios.delete(`${API_URL}/patients/${id}`, getAuthHeaders(token))
};
