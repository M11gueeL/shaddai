import React, { useEffect, useState, useCallback } from 'react';
import { 
  Database, 
  RotateCcw, 
  Upload, 
  AlertTriangle,
  FileDown,
  Clock,
  User,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert,
  Save,
  HardDrive
} from 'lucide-react';
import { getBackupHistory, createBackup, restoreFromHistory, restoreFromFile } from '../../../api/system';
import { useToast } from '../../../context/ToastContext';

// --- Componentes UI Reutilizables ---

const Modal = ({ isOpen, onClose, title, icon: Icon, type = 'info', children }) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600' },
    info: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600' }
  };
  
  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            {Icon && <div className={`p-2 rounded-lg ${style.bg} ${style.icon}`}><Icon className="w-5 h-5" /></div>}
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};



// --- Utilidades ---

const formatBytes = (bytes) => {
  if (typeof bytes !== 'number') return 'N/A';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// --- Componente Principal ---

export default function DatabaseBackupPanel() {
  const toast = useToast();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'history' | 'file'
  const [targetBackupId, setTargetBackupId] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBackupHistory();
      setBackups(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (err) {
      console.error('Error fetching backup history:', err);
      toast.error('No se pudo cargar el historial.');
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
      const response = await createBackup();
      if (response.data.success) {
        toast.success('Copia de seguridad creada correctamente.');
        await fetchHistory();
      } else {
        toast.error('Error al crear la copia de seguridad.');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.response?.data?.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const promptRestoreHistory = (backupId) => {
    setTargetBackupId(backupId);
    setModalType('history');
    setModalOpen(true);
  };

  const promptRestoreFile = () => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo SQL primero.');
      return;
    }
    setModalType('file');
    setModalOpen(true);
  };

  const confirmRestore = async () => {
    setModalOpen(false);
    setRestoring(true);

    try {
      let response;
      if (modalType === 'history' && targetBackupId) {
        response = await restoreFromHistory(targetBackupId);
      } else if (modalType === 'file' && selectedFile) {
        response = await restoreFromFile(selectedFile);
      } else {
        return;
      }

      if (response.data.success) {
        toast.success('Base de datos restaurada correctamente.');
        if (modalType === 'file') setSelectedFile(null);
      } else {
        toast.error(response.data.message || 'Error en la restauración.');
      }
    } catch (err) {
      console.error('Restore error:', err);
      toast.error(err.response?.data?.message || 'Error crítico al restaurar.');
    } finally {
      setRestoring(false);
      setTargetBackupId(null);
      setModalType(null);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header Panel */}
      <div className="bg-white p-8 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -z-1 opacity-60 transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Database className="w-7 h-7 text-blue-600" />
            </div>
            Gestión de Respaldos
          </h2>
          <p className="text-gray-500 mt-2 text-base max-w-lg">
            Administra los puntos de restauración del sistema y garantiza la integridad de tus datos.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
            <button
            onClick={handleCreateBackup}
            disabled={loading || restoring}
            className={`
                group relative px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 
                transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95
                bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                flex items-center gap-2.5 overflow-hidden
                ${loading ? 'opacity-75 cursor-wait' : ''}
            `}
            >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-shine" />
            {loading ? (
                <RotateCcw className="w-5 h-5 animate-spin" />
            ) : (
                <Save className="w-5 h-5" />
            )}
            <span>{loading ? 'Procesando...' : 'Crear Respaldo'}</span>
            </button>
        </div>
      </div>

      {/* Tabla de Historial */}
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2.5">
            <History className="w-5 h-5 text-gray-500" />
            Historial de Versiones
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            {backups.length} Disponibles
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha de Creación</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Archivo</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tamaño</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Autor</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && backups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                      </div>
                      <span className="text-gray-400 font-medium">Obteniendo datos...</span>
                    </div>
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-4 bg-gray-50 rounded-full">
                            <Database className="w-8 h-8 text-gray-300" />
                        </div>
                        <span className="text-gray-500 font-medium">No se han encontrado copias de seguridad.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="group hover:bg-blue-50/30 transition-colors duration-200">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                            <Clock className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-700">{formatDate(backup.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                        {backup.filename}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-gray-600 font-medium">
                      {formatBytes(backup.file_size)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 text-sm font-bold shadow-sm border border-indigo-200/50">
                          {backup.author?.first_name ? backup.author.first_name[0].toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">
                            {backup.author?.first_name ? `${backup.author.first_name} ${backup.author.last_name || ''}` : `Usuario #${backup.created_by}`}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {backup.author?.email || (backup.author?.first_name ? 'Administrador' : 'Sistema')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => promptRestoreHistory(backup.id)}
                        disabled={restoring}
                        className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 inline-flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restaurar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carga Manual */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden group hover:border-orange-200 transition-colors duration-300">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-400 rounded-l-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        <Upload className="w-5 h-5" />
                    </div>
                    Restauración Manual
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                    Importa un respaldo <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono text-xs">.sql</code> externo para restaurar la base de datos. 
                    Esta acción reemplazará todos los datos actuales. Asegúrate de tener una copia reciente antes de proceder.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <label className="w-full md:w-64 cursor-pointer">
                    <input
                        type="file"
                        accept=".sql"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-orange-50 file:text-orange-700
                        hover:file:bg-orange-100
                        cursor-pointer border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                </label>
                <button
                    onClick={promptRestoreFile}
                    disabled={!selectedFile || restoring}
                    className={`
                        w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-white shadow-md shadow-orange-500/20
                        bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600
                        transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2
                        ${(!selectedFile || restoring) ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                    `}
                >
                    {restoring ? <RotateCcw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                    <span>Restaurar</span>
                </button>
            </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirmación de Seguridad"
        icon={ShieldAlert}
        type="danger"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
                <p className="font-bold mb-1">Acción Destructiva e Irreversible</p>
                <p>Al restaurar la base de datos, toda la información registrada después de la fecha de la copia de seguridad será eliminada permanentemente.</p>
            </div>
          </div>

          <div className="text-gray-600 text-sm pl-2 border-l-4 border-gray-200">
             {modalType === 'history' 
              ? (
                  <>
                    Estás a punto de volver al estado del: <br/>
                    <span className="font-bold text-gray-800 text-base block mt-1">
                        {targetBackupId && backups.find(b => b.id === targetBackupId) ? formatDate(backups.find(b => b.id === targetBackupId).created_at) : 'Backup seleccionado'}
                    </span>
                  </>
                )
              : (
                  <>
                    Estás a punto de inyectar el archivo: <br/>
                    <span className="font-bold text-gray-800 text-base block mt-1">
                        {selectedFile?.name}
                    </span>
                  </>
              )
            }
          </div>

          <div className="flex gap-4 justify-end pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancelar Operación
            </button>
            <button
              onClick={confirmRestore}
              className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sí, Proceder con Restauración
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
