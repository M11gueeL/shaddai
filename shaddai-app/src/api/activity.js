import api from './axiosConfig';

const activityApi = {
  getRecent: (limit = 5) => api.get(`/activity/recent?limit=${limit}`),
};

export default activityApi;
