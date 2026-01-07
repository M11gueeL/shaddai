import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const auth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const generateReceipt = (accountId, token) => axios.get(`${API_URL}/receipts/generate/${accountId}`, auth(token)); // legacy manual trigger (will be auto, but kept for compatibility)
export const listReceiptsByPatient = (patientId, token) => axios.get(`${API_URL}/receipts/patient/${patientId}`, auth(token));
export const getReceiptByAccount = (accountId, token) => axios.get(`${API_URL}/receipts/account/${accountId}`, auth(token));
export const downloadReceiptUrl = (receiptId) => `${API_URL}/receipts/${receiptId}/download`;
export const downloadReceipt = (receiptId, token) => axios.get(`${API_URL}/receipts/${receiptId}/download`, { ...auth(token), responseType: 'blob' });

export const annulReceipt = (receiptId, reason, paymentsToRemove = [], token) => axios.post(`${API_URL}/receipts/${receiptId}/annul`, { reason, payments_to_remove: paymentsToRemove }, auth(token));

export const listAllReceipts = (params, token) => axios.get(`${API_URL}/receipts/list`, { ...auth(token), params });

