// src/api/medicalSchedules.js
import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default {
  // List all schedules (optionally by doctor)
  list: (token, { doctorId } = {}) => {
    const url = doctorId
      ? `${API_URL}/schedules/doctor/${doctorId}`
      : `${API_URL}/schedules`;
    return axios.get(url, getAuthHeaders(token));
  },

  // Get one schedule by id
  getById: (id, token) => axios.get(`${API_URL}/schedules/${id}`, getAuthHeaders(token)),

  // Create schedule (admin only)
  create: (data, token) => axios.post(`${API_URL}/schedules`, data, getAuthHeaders(token)),

  // Update schedule
  update: (id, data, token) => axios.put(`${API_URL}/schedules/${id}`, data, getAuthHeaders(token)),

  // Delete schedule
  remove: (id, token) => axios.delete(`${API_URL}/schedules/${id}`, getAuthHeaders(token)),
};
