import api from './axiosConfig';

export const createAccount = (data) => api.post('/accounts', data);
export const listAccounts = (params) => api.get('/accounts', { params });
export const getAccount = (id) => api.get(`/accounts/${id}`);
export const addDetail = (id, data) => api.post(`/accounts/${id}/details`, data);
export const removeDetail = (detailId) => api.delete(`/accounts/details/${detailId}`);
export const cancelAccount = (id) => api.post(`/accounts/${id}/cancel`, {});
// Supplies
export const addSupply = (id, data) => api.post(`/accounts/${id}/supplies`, data);
export const removeSupply = (supplyId) => api.delete(`/accounts/supplies/${supplyId}`);
