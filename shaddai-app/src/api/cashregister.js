import api from './axiosConfig';

export const openSession = (data) => api.post('/cash-sessions/open', data);
export const getStatus = () => api.get('/cash-sessions/status');
export const listMyMovements = () => api.get('/cash-sessions/movements');
export const closeSession = (data) => api.post('/cash-sessions/close', data);
export const adminListSessions = (params = {}) => {
    return api.get('/cash-sessions/admin/all', { params });
};
export const getSessionDetails = (id) => api.get(`/cash-sessions/details?id=${id}`);
export const downloadSessionReport = (id) => api.get(`/cash-sessions/report?id=${id}`, { responseType: 'blob' });

