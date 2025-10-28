import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const auth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const generateReceipt = (accountId, token) => axios.get(`${API_URL}/receipts/generate/${accountId}`, auth(token));
export const listReceiptsByPatient = (patientId, token) => axios.get(`${API_URL}/receipts/patient/${patientId}`, auth(token));
