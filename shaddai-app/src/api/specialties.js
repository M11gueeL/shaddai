import api from './axiosConfig'; 

export default {
    getAll: () => api.get('/specialties'),

    getById: (id) => api.get(`/specialties/${id}`),

    getByDoctorId: (doctorId) => api.get(`/specialties/doctor/${doctorId}`),

    create: (data) => api.post('/specialties', data),

    update: (id, data) => api.put(`/specialties/${id}`, data),

    delete: (id) => api.delete(`/specialties/${id}`)
};