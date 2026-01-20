import api from './axiosConfig';

export const login = (data) => api.post('/auth/login', data);

export const getRecaptchaSiteKey = () => api.get('/auth/recaptcha-site-key');

export const logout = () =>
  api.post('/auth/logout', {});

export const getProfile = () =>
  api.get('/auth/profile');

export const getSessions = () =>
  api.get('/auth/sessions');

/**
 * Llama a la API para solicitar un correo de restablecimiento.
 * Envía JSON, no FormData.
 * @param {string} email
 * @returns {Promise<axios.Response>}
 */
export const requestPasswordReset = (email) =>
  api.post('/auth/request-reset', { email });

/**
 * Llama a la API para enviar el token y la nueva contraseña.
 * @param {string} token
 * @param {string} new_password
 * @returns {Promise<axios.Response>}
 */
export const resetPassword = (token, new_password) =>
  api.post('/auth/reset-password', { token, new_password });

export const acceptInvitation = (token, password) =>
  api.post('/auth/accept-invitation', { token, password });
