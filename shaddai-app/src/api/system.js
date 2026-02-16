import api from './axiosConfig'; // Estaba importado como './axiosConfig' en el original, asumo que es correcto.

// Obtener historial de backups
export const getBackupHistory = () => api.get('/system/backups');

// Crear un nuevo backup (ahora devuelve JSON, no blob)
export const createBackup = () => api.get('/system/database/export');

// Restaurar desde historial
export const restoreFromHistory = (backupId) => api.post('/system/restore', { backup_id: backupId });

// Restaurar desde archivo subido
export const restoreFromFile = (file) => {
  const formData = new FormData();
  formData.append('backup_file', file);
  
  return api.post('/system/restore', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default {
  getBackupHistory,
  createBackup,
  restoreFromHistory,
  restoreFromFile
};
