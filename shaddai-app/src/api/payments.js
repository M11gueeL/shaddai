import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/shaddai/shaddai-api/public';

const auth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const createPayment = (accountId, data, token) => axios.post(`${API_URL}/accounts/${accountId}/payments`, data, auth(token));
export const listPaymentsByAccount = (accountId, token) => axios.get(`${API_URL}/accounts/${accountId}/payments`, auth(token));
export const verifyPayment = (paymentId, token) => axios.put(`${API_URL}/payments/${paymentId}/verify`, {}, auth(token));
export const deletePayment = (paymentId, token) => axios.delete(`${API_URL}/payments/${paymentId}`, auth(token));
export const listPendingPayments = (token) => axios.get(`${API_URL}/payments/admin/pending`, auth(token));
export const downloadPayment = (paymentId, token) => axios.get(`${API_URL}/payments/${paymentId}/download`, { ...auth(token), responseType: 'blob' });
export const getPaymentStats = (startDate, endDate, token) => axios.get(`${API_URL}/payments/reports/stats?startDate=${startDate}&endDate=${endDate}`, auth(token));
export const getGeneralReport = (startDate, endDate, token) => axios.get(`${API_URL}/payments/reports/general?startDate=${startDate}&endDate=${endDate}`, auth(token));
export const downloadGeneralReportPdf = (startDate, endDate, token) => axios.get(`${API_URL}/payments/reports/general/pdf?startDate=${startDate}&endDate=${endDate}`, { ...auth(token), responseType: 'blob' });
