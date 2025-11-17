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
  
  // Validar slot específico
  validateSlot: (slotData, token) => axios.post(`${API_URL}/appointments/validate-slot`, slotData, getAuthHeaders(token))
  ,
  // Obtener citas de hoy
  getToday: (token) => axios.get(`${API_URL}/appointments/today`, getAuthHeaders(token)),

  // Obtener estadísticas de citas/pacientes
  getStats: (token) => axios.get(`${API_URL}/appointments/stats`, getAuthHeaders(token))
};
