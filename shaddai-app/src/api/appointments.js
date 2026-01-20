import api from './axiosConfig';

// Exportamos un objeto con todas las funciones
export default {
  // Obtener todas las citas
  getAll: () => api.get('/appointments'),
  
  // Obtener cita por ID
  getById: (id) => api.get(`/appointments/${id}`),

  // Obtener historial de la cita
  getHistory: (id) => api.get(`/appointments/${id}/history`),
  
  // Crear cita
  create: (appointmentData) => api.post('/appointments', appointmentData),
  
  // Actualizar cita
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  
  // Eliminar cita
  delete: (id) => api.delete(`/appointments/${id}`),
  
  // Obtener citas por fecha
  getByDate: (date) => api.get(`/appointments/date/${date}`),
  
  // Obtener citas por médico
  getByDoctor: (doctorId, date = null) => {
    const url = date 
      ? `/appointments/doctor/${doctorId}?date=${date}`
      : `/appointments/doctor/${doctorId}`;
    return api.get(url);
  },
  
  // Obtener citas por paciente
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
  
  // Actualizar estado de cita
  updateStatus: (id, statusData) => api.post(`/appointments/${id}/status`, statusData),
  
  // Verificar disponibilidad
  checkAvailability: (availabilityData) => api.get('/appointments/availability', {
    params: availabilityData
  }),
  
  // Obtener mis citas del día (para el médico logueado)
  getMyDaily: () => api.get('/appointments/my-daily'),

  // Validar slot específico
  validateSlot: (slotData) => api.post('/appointments/validate-slot', slotData),

  // Obtener citas de hoy
  getToday: () => api.get('/appointments/today'),

  // Obtener estadísticas de citas/pacientes
  getStats: () => api.get('/appointments/stats'),

  exportReport: (filters) => api.get('/appointments/report/export', {
    params: filters, 
    responseType: 'blob' 
  }),

  // Exportar reporte de paciente
  exportPatientReport: (params) => api.get('/appointments/report/patient-export', {
    params,
    responseType: 'blob'
  }),

  // Exportar reporte de médico
  exportDoctorReport: (params) => api.get('/appointments/report/doctor-export', {
    params,
    responseType: 'blob'
  }),

  // Exportar reporte de especialidad
  exportSpecialtyReport: (params) => api.get('/appointments/report/specialty-export', {
    params,
    responseType: 'blob'
  }),

  // Obtener estadísticas avanzadas
  getAdvancedStats: (params) => api.get('/appointments/advanced-stats', {
    params
  }),

   // Exportar reporte de rendimiento (PDF)
  exportPerformanceReport: (params) => api.get('/appointments/report/performance-export', {
    params,
    responseType: 'blob'
  }),
};
