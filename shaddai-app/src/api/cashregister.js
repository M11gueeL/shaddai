import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const auth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const openSession = (data, token) => axios.post(`${API_URL}/cash-sessions/open`, data, auth(token));
export const getStatus = (token) => axios.get(`${API_URL}/cash-sessions/status`, auth(token));
export const listMyMovements = (token) => axios.get(`${API_URL}/cash-sessions/movements`, auth(token));
export const closeSession = (data, token) => axios.post(`${API_URL}/cash-sessions/close`, data, auth(token));
export const adminListSessions = (token, status = null) => {
    let url = `${API_URL}/cash-sessions/admin/all`;
    if (status) url += `?status=${status}`;
    return axios.get(url, auth(token));
};
export const getSessionDetails = (id, token) => axios.get(`${API_URL}/cash-sessions/details?id=${id}`, auth(token));
export const downloadSessionReport = (id, token) => axios.get(`${API_URL}/cash-sessions/report?id=${id}`, { ...auth(token), responseType: 'blob' });

