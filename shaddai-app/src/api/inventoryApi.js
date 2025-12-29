import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listInventory = (params = {}, token) =>
  axios.get(`${API_URL}/inventory`, { ...auth(token), params });

export const getInventoryStats = (token) =>
  axios.get(`${API_URL}/inventory/stats`, auth(token));

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

export const registerInternalConsumption = (data, token) =>
  axios.post(`${API_URL}/inventory/internal-consumption`, data, auth(token));

export const listInventoryMovements = (id, params = {}, token) =>
  axios.get(`${API_URL}/inventory/${id}/movements`, { ...auth(token), params });

export const getExpiringItems = (token) =>
  axios.get(`${API_URL}/inventory/expiring`, auth(token));

export const generateInventoryReport = (params, token) =>
  axios.get(`${API_URL}/inventory/reports`, { ...auth(token), params, responseType: 'blob' });

export const getBatches = (id, token) =>
  axios.get(`${API_URL}/inventory/${id}/batches`, auth(token));

export const discardBatch = (data, token) =>
  axios.post(`${API_URL}/inventory/batches/discard`, data, auth(token));

export const adjustBatch = (data, token) =>
  axios.post(`${API_URL}/inventory/batches/adjust`, data, auth(token));

export const toggleBatchStatus = (data, token) =>
  axios.post(`${API_URL}/inventory/batches/status`, data, auth(token));

export const updateBatchExpiration = (data, token) =>
  axios.post(`${API_URL}/inventory/batches/update-expiration`, data, auth(token));

// --- BRANDS ---
export const getBrands = (params = {}, token) =>
  axios.get(`${API_URL}/brands`, { ...auth(token), params });

export const createBrand = (data, token) =>
  axios.post(`${API_URL}/brands`, data, auth(token));

export const updateBrand = (id, data, token) =>
  axios.put(`${API_URL}/brands/${id}`, data, auth(token));

export const deleteBrand = (id, token) =>
  axios.delete(`${API_URL}/brands/${id}`, auth(token));
