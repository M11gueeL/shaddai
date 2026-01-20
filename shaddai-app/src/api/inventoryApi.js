import api from './axiosConfig';

export const listInventory = (params = {}) => api.get('/inventory', { params });

export const getInventoryStats = () => api.get('/inventory/stats');

export const getInventoryItem = (id) => api.get(`/inventory/${id}`);

export const createInventoryItem = (data) => api.post('/inventory', data);

export const updateInventoryItem = (id, data) => api.put(`/inventory/${id}`, data);

export const deleteInventoryItem = (id) => api.delete(`/inventory/${id}`);

export const restockInventoryItem = (id, data) => api.post(`/inventory/${id}/restock`, data);

export const registerInternalConsumption = (data) => api.post('/inventory/internal-consumption', data);

export const listInventoryMovements = (id, params = {}) => api.get(`/inventory/${id}/movements`, { params });

export const getExpiringItems = () => api.get('/inventory/expiring');

export const generateInventoryReport = (params) => api.get('/inventory/reports', { params, responseType: 'blob' });

export const getBatches = (id) => api.get(`/inventory/${id}/batches`);

export const discardBatch = (data) => api.post('/inventory/batches/discard', data);

export const adjustBatch = (data) => api.post('/inventory/batches/adjust', data);

export const toggleBatchStatus = (data) => api.post('/inventory/batches/status', data);

export const updateBatchExpiration = (data) => api.post('/inventory/batches/update-expiration', data);

// --- BRANDS ---
export const getBrands = (params = {}) => api.get('/brands', { params });

export const createBrand = (data) => api.post('/brands', data);

export const updateBrand = (id, data) => api.put(`/brands/${id}`, data);

export const deleteBrand = (id) => api.delete(`/brands/${id}`);
