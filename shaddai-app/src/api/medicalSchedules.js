import api from './axiosConfig';

export default {
  // List all schedules (optionally by doctor)
  list: ({ doctorId } = {}) => {
    const url = doctorId
      ? `/schedules/doctor/${doctorId}`
      : `/schedules`;
    return api.get(url);
  },

  // Get one schedule by id
  getById: (id) => api.get(`/schedules/${id}`),

  // Create schedule (admin only)
  create: (data) => api.post('/schedules', data),

  // Update schedule
  update: (id, data) => api.put(`/schedules/${id}`, data),

  // Delete schedule
  remove: (id) => api.delete(`/schedules/${id}`),
};
