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
  // Obtener todos los usuarios
  getAll: (token) => axios.get(`${API_URL}/users`, getAuthHeaders(token)),
  
  // Obtener usuario por ID
  getById: (id, token) => axios.get(`${API_URL}/users/${id}`, getAuthHeaders(token)),

  // Obtener usuarios que son médicos
  getDoctors: (token) => axios.get(`${API_URL}/users/doctors`, getAuthHeaders(token)),

  // Obtener todas las especialidades de un usuario (médico)
  getSpecialtiesByDoctorId: (doctorId, token) => axios.get(`${API_URL}/specialties/doctor/${doctorId}`, getAuthHeaders(token)), 
  
  // Crear usuario
  create: (userData, token) => axios.post(`${API_URL}/users`, userData, getAuthHeaders(token)),
  
  // Actualizar usuario
  update: (id, userData, token) => axios.put(`${API_URL}/users/${id}`, userData, getAuthHeaders(token))
    .then(response => response.data),
  
  // Eliminar usuario
  delete: (id, token) => axios.delete(`${API_URL}/users/${id}`, getAuthHeaders(token)),
  
  // Cambiar estado (activar/desactivar)
  toggleStatus: (id, token) => axios.patch(`${API_URL}/users/${id}/status`, {}, getAuthHeaders(token)),
  
  // Obtener especialidades
  getSpecialties: (token) => axios.get(`${API_URL}/specialties`, getAuthHeaders(token)),
  
  // Obtener colegios médicos
  getMedicalColleges: (token) => axios.get(`${API_URL}/medicalcolleges`, getAuthHeaders(token)),

  // Obtener estadísticas del usuario actual
  getMyStats: (token) => axios.get(`${API_URL}/users/my-stats`, getAuthHeaders(token)).then(response => response.data)
};