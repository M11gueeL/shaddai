import axios from 'axios';

export const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const auth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const createPayment = (accountId, data, token) => axios.post(`${API_URL}/accounts/${accountId}/payments`, data, auth(token));
export const listPaymentsByAccount = (accountId, token) => axios.get(`${API_URL}/accounts/${accountId}/payments`, auth(token));
export const verifyPayment = (paymentId, token) => axios.put(`${API_URL}/payments/${paymentId}/verify`, {}, auth(token));
export const deletePayment = (paymentId, token) => axios.delete(`${API_URL}/payments/${paymentId}`, auth(token));
export const listPendingPayments = (token) => axios.get(`${API_URL}/payments/admin/pending`, auth(token));
