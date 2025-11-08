import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const auth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const createAccount = (data, token) => axios.post(`${API_URL}/accounts`, data, auth(token));
export const listAccounts = (params, token) => axios.get(`${API_URL}/accounts`, { ...auth(token), params });
export const getAccount = (id, token) => axios.get(`${API_URL}/accounts/${id}`, auth(token));
export const addDetail = (id, data, token) => axios.post(`${API_URL}/accounts/${id}/details`, data, auth(token));
export const removeDetail = (detailId, token) => axios.delete(`${API_URL}/accounts/details/${detailId}`, auth(token));
export const cancelAccount = (id, token) => axios.post(`${API_URL}/accounts/${id}/cancel`, {}, auth(token));
// Supplies
export const addSupply = (id, data, token) => axios.post(`${API_URL}/accounts/${id}/supplies`, data, auth(token));
export const removeSupply = (supplyId, token) => axios.delete(`${API_URL}/accounts/supplies/${supplyId}`, auth(token));
