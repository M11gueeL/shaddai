import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSpecialties = async () => {
    try {
        const response = await axios.get(`${API_URL}/specialties`, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        throw error;
    }
};
