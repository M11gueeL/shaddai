import api from './axiosConfig';

export const getConsultingRooms = async () => {
    try {
        const response = await api.get('/consulting-rooms');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getConsultingRoomById = async (id) => {
    try {
        const response = await api.get(`/consulting-rooms/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getConsultingRoomsBySpecialty = async (specialtyId) => {
    try {
        const response = await api.get(`/consulting-rooms/specialty/${specialtyId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createConsultingRoom = async (data) => {
    try {
        const response = await api.post('/consulting-rooms', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateConsultingRoom = async (id, data) => {
    try {
        const response = await api.put(`/consulting-rooms/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteConsultingRoom = async (id) => {
    try {
        const response = await api.delete(`/consulting-rooms/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
