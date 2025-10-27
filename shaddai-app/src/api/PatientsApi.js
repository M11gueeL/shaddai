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
  delete: (id, token) => axios.delete(`${API_URL}/patients/${id}`, getAuthHeaders(token)),

  // Búsqueda rápida con filtros (typeahead)
  search: ({ q, by = ['cedula', 'full_name'], dob = null, limit = 10 }, token) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (Array.isArray(by)) {
      by.forEach((b) => params.append('by[]', b));
    } else if (by) {
      params.append('by', by);
    }
    if (dob) params.append('dob', dob);
    if (limit) params.append('limit', limit);
    return axios.get(`${API_URL}/patients/search?${params.toString()}`, getAuthHeaders(token));
  }
};
