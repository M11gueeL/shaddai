import api from './axiosConfig';

export const generateReceipt = (accountId) => api.get(`/receipts/generate/${accountId}`); // legacy manual trigger
export const listReceiptsByPatient = (patientId) => api.get(`/receipts/patient/${patientId}`);
export const getReceiptByAccount = (accountId) => api.get(`/receipts/account/${accountId}`);

export const downloadReceiptUrl = (receiptId) => `${import.meta.env.VITE_API_URL}/receipts/${receiptId}/download`;

export const downloadReceipt = (receiptId) => api.get(`/receipts/${receiptId}/download`, { responseType: 'blob' });

export const annulReceipt = (receiptId, reason, paymentsToRemove = []) => api.post(`/receipts/${receiptId}/annul`, { reason, payments_to_remove: paymentsToRemove });

export const listAllReceipts = (params) => api.get('/receipts/list', { params });

