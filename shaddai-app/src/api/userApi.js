import api from './axiosConfig';

export default {
  // Obtener todos los usuarios
  getAll: () => api.get('/users'),
  
  // Obtener usuario por ID
  getById: (id) => api.get(`/users/${id}`),

  // Obtener usuarios que son médicos
  getDoctors: () => api.get('/users/doctors'),

  // Obtener todas las especialidades de un usuario (médico)
  getSpecialtiesByDoctorId: (doctorId) => api.get(`/specialties/doctor/${doctorId}`), 
  
  // Crear usuario
  create: (userData) => api.post('/users', userData),
  
  // Actualizar usuario
  update: (id, userData) => api.put(`/users/${id}`, userData)
    .then(response => response.data),
  
  // Eliminar usuario
  delete: (id) => api.delete(`/users/${id}`),
  
  // Cambiar estado (activar/desactivar)
  toggleStatus: (id) => api.patch(`/users/${id}/status`, {}),

  // Reenviar invitación
  resendInvitation: (id) => api.post(`/users/${id}/resend-invitation`, {}),
  
  // Obtener especialidades
  getSpecialties: () => api.get('/specialties'),
  
  // Obtener colegios médicos
  getMedicalColleges: () => api.get('/medicalcolleges'),

  // Obtener estadísticas del usuario actual
  getMyStats: () => api.get('/users/my-stats').then(response => response.data)
};
