import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getConsultingRooms = async () => {
    try {
        const response = await axios.get(`${API_URL}/consulting-rooms`, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getConsultingRoomById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/consulting-rooms/${id}`, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getConsultingRoomsBySpecialty = async (specialtyId) => {
    try {
        const response = await axios.get(`${API_URL}/consulting-rooms/specialty/${specialtyId}`, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createConsultingRoom = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/consulting-rooms`, data, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateConsultingRoom = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/consulting-rooms/${id}`, data, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteConsultingRoom = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/consulting-rooms/${id}`, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        throw error;
    }
};
