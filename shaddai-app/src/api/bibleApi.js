
/**
 * Servicio para obtener el versículo del día de BibleGateway.
 * Usa la versión Reina-Valera 1960 (RVR1960).
 */

import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public'; 

export const getVerseOfTheDay = async () => {
    try {
        const response = await axios.get(`${API_URL}/external/votd`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo el versículo del día desde el servidor local:", error);
        throw error;
    }
};