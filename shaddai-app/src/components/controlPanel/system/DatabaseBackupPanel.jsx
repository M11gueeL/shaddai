import React, { useEffect, useState, useCallback } from 'react';
import { 
  Database, 
  RotateCcw, 
  Upload, 
  Trash2,
  AlertTriangle,
  FileDown,
  Clock,
  User,
  HardDrive,
  History,
  ShieldCheck
} from 'lucide-react';
import { getBackupHistory, createBackup, restoreFromHistory, restoreFromFile } from '../../../api/system';
import { useAuth } from '../../../context/AuthContext';

const formatBytes = (bytes) => {
  if (typeof bytes !== 'number') {
    return 'N/A';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  const precision = value < 10 && idx > 0 ? 1 : 0;
  return `${value.toFixed(precision)} ${units[idx]}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

export default function DatabaseBackupPanel() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBackupHistory();
      // Ajuste: si el backend devuelve array directo o { data: [...] }
      setBackups(Array.isArray(response.data) ? response.data : (response.data?.data || []));
      setError('');
    } catch (err) {
      console.error('Error fetching backup history:', err);
      setError('No se pudo cargar el historial de copias de seguridad.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await createBackup();
      
      if (response.data.success) {
        setSuccess('Copia de seguridad creada exitosamente.');
        await fetchHistory(); // Recargar lista
      } else {
        setError('Error al crear la copia de seguridad.');
      }
    } catch (err) {
      console.error('Error creating backup:', err);
      setError(err.response?.data?.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromHistory = async (backupId) => {
    if (!window.confirm('⚠️ ADVERTENCIA CRÍTICA ⚠️\n\nEstás a punto de RESTAURAR la base de datos a un estado anterior.\n\nTODOS los datos creados después de esta copia de seguridad SE PERDERÁN permanentemente.\n\n¿Estás absolutamente seguro de continuar?')) {
      return;
    }

    try {
      setRestoring(true);
      setError('');
      setSuccess('');

      const response = await restoreFromHistory(backupId);
      
      if (response.data.success) {
        setSuccess('Base de datos restaurada correctamente. El sistema puede requerir volver a iniciar sesión.');
        // Opcional: forzar logout o recarga
      } else {
        setError(response.data.message || 'Error al restaurar la base de datos.');
      }
    } catch (err) {
      console.error('Error restoring database:', err);
      setError(err.response?.data?.message || 'Error crítico durante la restauración.');
    } finally {
      setRestoring(false);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError('');
    }
  };

  const handleRestoreFromFile = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona un archivo SQL primero.');
      return;
    }

    if (!window.confirm(`⚠️ ADVERTENCIA CRÍTICA ⚠️\n\nVas a restaurar la base de datos usando un archivo EXTERNO:\n"${selectedFile.name}"\n\nTODOS los datos actuales serán REEMPLAZADOS.\n\n¿Confirmar restauración?`)) {
      return;
    }

    try {
      setRestoring(true);
      setError('');
      setSuccess('');

      const response = await restoreFromFile(selectedFile);
      
      if (response.data.success) {
        setSuccess('Base de datos restaurada correctamente desde el archivo. El sistema se ha actualizado.');
        setSelectedFile(null); // Reset file input
        // Limpiar input file visual si fuera necesario con ref
      } else {
        setError(response.data.message || 'Error al restaurar desde el archivo.');
      }
    } catch (err) {
      console.error('Error restoring from file:', err);
      setError(err.response?.data?.message || 'Error crítico durante la restauración.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header y Acciones Principales */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-600" />
              Copias de Seguridad
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona los puntos de restauración del sistema.
            </p>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={loading || restoring}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Generar Nueva Copia
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md flex items-start gap-2">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Tabla de Historial */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <History className="w-4 h-4" />
            Historial de Respaldos
          </h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {backups.length} disponibles
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Archivo</th>
                <th className="px-6 py-3">Tamaño</th>
                <th className="px-6 py-3">Creado Por</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && backups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    Cargando historial...
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No hay copias de seguridad registradas.
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatDate(backup.created_at)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {backup.filename}
                    </td>
                    <td className="px-6 py-4">
                      {formatBytes(backup.file_size)}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      ID: {backup.created_by}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRestoreFromHistory(backup.id)}
                        disabled={restoring}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded transition-colors text-xs font-semibold uppercase tracking-wide border border-transparent hover:border-red-200"
                        title="Restaurar este punto"
                      >
                        {restoring ? '...' : 'Restaurar'}
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restauración Manual */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-orange-400">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-orange-500" />
          Restauración Manual desde Archivo
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Si tienes un archivo <code>.sql</code> descargado previamente, puedes subirlo aquí para restaurar la base de datos.
          <br />
          <span className="text-red-600 font-semibold">Nota: Esta acción es irreversible.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="file"
            accept=".sql"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-orange-50 file:text-orange-700
              hover:file:bg-orange-100
              cursor-pointer border border-gray-300 rounded-md"
          />
          <button
            onClick={handleRestoreFromFile}
            disabled={!selectedFile || restoring}
            className={`px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors whitespace-nowrap flex items-center gap-2 ${(!selectedFile || restoring) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {restoring ? <RotateCcw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
            Subir y Restaurar
          </button>
        </div>
      </div>

    </div>
  );
}
