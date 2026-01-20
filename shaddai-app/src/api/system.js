import api from './axiosConfig';

export const exportDatabaseDump = () => api.get(
  '/system/database/export',
  {
    responseType: 'blob'
  }
);

export default {
  exportDatabaseDump
};
