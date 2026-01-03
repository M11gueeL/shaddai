import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

// Función para obtener headers con token
const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Exportamos un objeto con todas las funciones
export default {
  // Obtener todas las citas
  getAll: (token) => axios.get(`${API_URL}/appointments`, getAuthHeaders(token)),
  
  // Obtener cita por ID
  getById: (id, token) => axios.get(`${API_URL}/appointments/${id}`, getAuthHeaders(token)),
  
  // Crear cita
  create: (appointmentData, token) => axios.post(`${API_URL}/appointments`, appointmentData, getAuthHeaders(token)),
  
  // Actualizar cita
  update: (id, appointmentData, token) => axios.put(`${API_URL}/appointments/${id}`, appointmentData, getAuthHeaders(token)),
  
  // Eliminar cita
  delete: (id, token) => axios.delete(`${API_URL}/appointments/${id}`, getAuthHeaders(token)),
  
  // Obtener citas por fecha
  getByDate: (date, token) => axios.get(`${API_URL}/appointments/date/${date}`, getAuthHeaders(token)),
  
  // Obtener citas por médico
  getByDoctor: (doctorId, token, date = null) => {
    const url = date 
      ? `${API_URL}/appointments/doctor/${doctorId}?date=${date}`
      : `${API_URL}/appointments/doctor/${doctorId}`;
    return axios.get(url, getAuthHeaders(token));
  },
  
  // Obtener citas por paciente
  getByPatient: (patientId, token) => axios.get(`${API_URL}/appointments/patient/${patientId}`, getAuthHeaders(token)),
  
  // Actualizar estado de cita
  updateStatus: (id, statusData, token) => axios.post(`${API_URL}/appointments/${id}/status`, statusData, getAuthHeaders(token)),
  
  // Verificar disponibilidad
  checkAvailability: (availabilityData, token) => axios.get(`${API_URL}/appointments/availability`, {
    ...getAuthHeaders(token),
    params: availabilityData
  }),
  
  // Obtener mis citas del día (para el médico logueado)
  getMyDaily: (token) => axios.get(`${API_URL}/appointments/my-daily`, getAuthHeaders(token)),

  // Validar slot específico
  validateSlot: (slotData, token) => axios.post(`${API_URL}/appointments/validate-slot`, slotData, getAuthHeaders(token))
  ,
  // Obtener citas de hoy
  getToday: (token) => axios.get(`${API_URL}/appointments/today`, getAuthHeaders(token)),

  // Obtener estadísticas de citas/pacientes
  getStats: (token) => axios.get(`${API_URL}/appointments/stats`, getAuthHeaders(token)),

  exportReport: (filters, token) => axios.get(`${API_URL}/appointments/report/export`, {
    ...getAuthHeaders(token),
    params: filters, 
    responseType: 'blob' 
  }),

  // Exportar reporte de paciente
  exportPatientReport: (params, token) => axios.get(`${API_URL}/appointments/report/patient-export`, {
    ...getAuthHeaders(token),
    params,
    responseType: 'blob'
  }),

  // Exportar reporte de médico
  exportDoctorReport: (params, token) => axios.get(`${API_URL}/appointments/report/doctor-export`, {
    ...getAuthHeaders(token),
    params,
    responseType: 'blob'
  }),

  // Exportar reporte de especialidad
  exportSpecialtyReport: (params, token) => axios.get(`${API_URL}/appointments/report/specialty-export`, {
    ...getAuthHeaders(token),
    params,
    responseType: 'blob'
  }),

  // Obtener estadísticas avanzadas
  getAdvancedStats: (params, token) => axios.get(`${API_URL}/appointments/advanced-stats`, {
    ...getAuthHeaders(token),
    params
  }),

  // Exportar reporte de rendimiento (PDF)
  exportPerformanceReport: (params, token) => axios.get(`${API_URL}/appointments/report/performance-export`, {
    ...getAuthHeaders(token),
    params,
    responseType: 'blob'
  }),

  // Obtener mis citas del día (para el médico logueado)
  getMyDaily: (token) => axios.get(`${API_URL}/appointments/my-daily`, getAuthHeaders(token)),
};
