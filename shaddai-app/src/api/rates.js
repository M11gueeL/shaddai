import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const auth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getTodayRate = (token) => axios.get(`${API_URL}/rates/today`, auth(token));
export const listRates = (token) => axios.get(`${API_URL}/rates`, auth(token));
export const createRate = (data, token) => axios.post(`${API_URL}/rates`, data, auth(token));
