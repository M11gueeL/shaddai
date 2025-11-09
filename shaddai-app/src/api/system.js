import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

export const exportDatabaseDump = (token) => axios.get(
  `${API_URL}/system/database/export`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    },
    responseType: 'blob'
  }
);

export default {
  exportDatabaseDump
};
