import api from './axiosConfig';

export const getVerseOfTheDay = async () => {
    try {
        const response = await api.get('/external/votd');
        return response.data;
    } catch (error) {
        console.error("Error obteniendo el versículo del día desde el servidor local:", error);
        throw error;
    }
};
