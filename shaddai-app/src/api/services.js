import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const auth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const listServices = (token) => axios.get(`${API_URL}/services`, auth(token));
export const getService = (id, token) => axios.get(`${API_URL}/services/${id}`, auth(token));
export const createService = (data, token) => axios.post(`${API_URL}/services`, data, auth(token));
export const updateService = (id, data, token) => axios.put(`${API_URL}/services/${id}`, data, auth(token));
export const deleteService = (id, token) => axios.delete(`${API_URL}/services/${id}`, auth(token));
