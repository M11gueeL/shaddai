import api from './axiosConfig';

export default {
    getAll: () => api.get('/notifications/rules'),
    create: (data) => api.post('/notifications/rules', data),
    update: (id, data) => api.put(`/notifications/rules/${id}`, data),
    delete: (id) => api.delete(`/notifications/rules/${id}`)
};
