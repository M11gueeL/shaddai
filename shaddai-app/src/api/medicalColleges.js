import api from './axiosConfig';

export default {
    // Obtener todos los colegios médicos
    getAll: () => api.get('/medicalcolleges'),

    // Obtener colegio médico por ID
    getById: (id) => api.get(`/medicalcolleges/${id}`),

    // Crear colegio médico
    create: (data) => api.post('/medicalcolleges', data),

    // Actualizar colegio médico
    update: (id, data) => api.put(`/medicalcolleges/${id}`, data),

    // Eliminar colegio médico
    delete: (id) => api.delete(`/medicalcolleges/${id}`),
}
