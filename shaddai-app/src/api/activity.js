import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const getAuthHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const activityApi = {
  getRecent: (token, limit = 5) => axios.get(`${API_URL}/activity/recent?limit=${limit}`, getAuthHeaders(token)),
};

export default activityApi;
