// shaddai-app/src/api/authApi.js
// TU CÓDIGO EXISTENTE (SIN CAMBIOS)
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

// --- INICIO DE NUEVO CÓDIGO ---
// Añadimos las dos nuevas funciones de la API

/**
 * Llama a la API para solicitar un correo de restablecimiento.
 * Envía JSON, no FormData.
 * @param {string} email
 * @returns {Promise<axios.Response>}
 */
export const requestPasswordReset = (email) =>
  axios.post(`${API}/request-reset`, { email });

/**
 * Llama a la API para enviar el token y la nueva contraseña.
 * @param {string} token
 * @param {string} new_password
 * @returns {Promise<axios.Response>}
 */
export const resetPassword = (token, new_password) =>
  axios.post(`${API}/reset-password`, { token, new_password });

// --- FIN DE NUEVO CÓDIGO ---