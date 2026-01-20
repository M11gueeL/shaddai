import api from './axiosConfig';

export default {

    // Obtener todos los pacientes
    getAll: () => api.get('/patients/'),

    // Obtener paciente por ID
  getById: (id) => api.get(`/patients/${id}`),

  // Obtener paciente por cédula
  getByCedula: (cedula) => api.get(`/patients/cedula/${cedula}`),
  
  // Crear paciente
  create: (patientData) => api.post('/patients', patientData),
  
  // Actualizar paciente
  update: (id, patientData) => api.put(`/patients/${id}`, patientData),
  
  // Eliminar paciente
  delete: (id) => api.delete(`/patients/${id}`),

  // Búsqueda rápida con filtros (typeahead)
  search: ({ q, by = ['cedula', 'full_name'], dob = null, limit = 10 }) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (Array.isArray(by)) {
      by.forEach((b) => params.append('by[]', b));
    } else if (by) {
      params.append('by', by);
    }
    if (dob) params.append('dob', dob);
    if (limit) params.append('limit', limit);
    return api.get(`/patients/search?${params.toString()}`);
  }
};
