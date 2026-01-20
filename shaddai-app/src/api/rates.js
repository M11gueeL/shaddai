import api from './axiosConfig';

export const getTodayRate = () => api.get('/rates/today');
export const listRates = () => api.get('/rates');
export const createRate = (data) => api.post('/rates', data);
