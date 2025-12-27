import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listInventory = (params = {}, token) =>
  axios.get(`${API_URL}/inventory`, { ...auth(token), params });

export const getInventoryItem = (id, token) =>
  axios.get(`${API_URL}/inventory/${id}`, auth(token));

export const createInventoryItem = (data, token) =>
  axios.post(`${API_URL}/inventory`, data, auth(token));

export const updateInventoryItem = (id, data, token) =>
  axios.put(`${API_URL}/inventory/${id}`, data, auth(token));

export const deleteInventoryItem = (id, token) =>
  axios.delete(`${API_URL}/inventory/${id}`, auth(token));

export const restockInventoryItem = (id, data, token) =>
  axios.post(`${API_URL}/inventory/${id}/restock`, data, auth(token));

export const listInventoryMovements = (id, params = {}, token) =>
  axios.get(`${API_URL}/inventory/${id}/movements`, { ...auth(token), params });

export const getExpiringItems = (token) =>
  axios.get(`${API_URL}/inventory/expiring`, auth(token));

export const getBatches = (id, token) =>
  axios.get(`${API_URL}/inventory/${id}/batches`, auth(token));

export const discardBatch = (data, token) =>
  axios.post(`${API_URL}/inventory/batches/discard`, data, auth(token));

export const adjustBatch = (data, token) =>
  axios.post(`${API_URL}/inventory/batches/adjust`, data, auth(token));

export const toggleBatchStatus = (data, token) =>
  axios.post(`${API_URL}/inventory/batches/status`, data, auth(token));
