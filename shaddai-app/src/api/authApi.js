import axios from "axios";

const API = "http://localhost/shaddai/shaddai-api/public/auth";

export const login = (data) => axios.post(`${API}/login`, data);

export const logout = (token) =>
  axios.post(
    `${API}/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const getProfile = (token) =>
  axios.get(`${API}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getSessions = (token) =>
  axios.get(`${API}/sessions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
