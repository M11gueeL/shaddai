import api from './axiosConfig';

export const createPayment = (accountId, data) => api.post(`/accounts/${accountId}/payments`, data);
export const listPaymentsByAccount = (accountId) => api.get(`/accounts/${accountId}/payments`);
export const verifyPayment = (paymentId) => api.put(`/payments/${paymentId}/verify`, {});
export const deletePayment = (paymentId) => api.delete(`/payments/${paymentId}`);
export const listPendingPayments = () => api.get('/payments/admin/pending');
export const downloadPayment = (paymentId) => api.get(`/payments/${paymentId}/download`, { responseType: 'blob' });
export const getPaymentStats = (startDate, endDate) => api.get(`/payments/reports/stats?startDate=${startDate}&endDate=${endDate}`);
export const getGeneralReport = (startDate, endDate) => api.get(`/payments/reports/general?startDate=${startDate}&endDate=${endDate}`);
export const downloadGeneralReportPdf = (startDate, endDate) => api.get(`/payments/reports/general/pdf?startDate=${startDate}&endDate=${endDate}`, { responseType: 'blob' });
export const downloadDebtorsReportPdf = () => api.get('/payments/reports/debtors/pdf', { responseType: 'blob' });
export const downloadServicesPerformanceReportPdf = (startDate, endDate) => api.get(`/payments/reports/services/pdf?startDate=${startDate}&endDate=${endDate}`, { responseType: 'blob' });
