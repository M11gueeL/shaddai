import React, { useEffect, useState } from 'react';
import { DownloadCloud, HardDrive, History, ShieldCheck } from 'lucide-react';
import { exportDatabaseDump } from '../../../api/system';
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

export default function DatabaseBackupPanel() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastExport, setLastExport] = useState(null);
  const storageKey = user?.id ? `shaddai:last-backup:${user.id}` : 'shaddai:last-backup';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setLastExport(null);
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date) {
        setLastExport({
          ...parsed,
          date: new Date(parsed.date)
        });
      } else {
        setLastExport(null);
      }
    } catch (readError) {
      console.warn('No se pudo restaurar el último respaldo almacenado:', readError);
      setLastExport(null);
    }
  }, [storageKey]);

  const handleExport = async () => {
    if (!token || loading) {
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await exportDatabaseDump(token);
      const blob = response.data;
      const contentDisposition = response.headers['content-disposition'];
      let filename = `shaddai_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/i);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.setAttribute('download', filename);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      const timestamp = new Date();
      const exportMeta = {
        date: timestamp,
        size: blob.size,
        filename
      };

      setLastExport(exportMeta);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(storageKey, JSON.stringify({
            ...exportMeta,
            date: timestamp.toISOString()
          }));
        }
      } catch (writeError) {
        console.warn('No se pudo guardar la información del respaldo:', writeError);
      }
      setSuccess('Copia de seguridad generada correctamente.');
    } catch (requestError) {
      const apiMessage = requestError.response?.data?.message;
      setError(apiMessage || 'No se pudo generar la copia de seguridad en este momento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-800 to-purple-700 text-white shadow-xl">
        <div className="absolute inset-y-0 right-0 w-1/3 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]" />
        <div className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="md:w-3/5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-wider text-indigo-100">
                <ShieldCheck className="h-3.5 w-3.5" /> Respaldo
              </span>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">Respaldo Instantáneo de la Base de Datos</h2>
              <p className="mt-3 text-indigo-100/90 text-sm md:text-base">
                Genera copias de seguridad y controla la integridad de la información con un solo clic.
              </p>
            </div>
            <div className="md:w-2/5">
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 text-indigo-50 shadow-lg">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-indigo-200">Último respaldo</h3>
                {lastExport ? (
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-semibold text-white">{lastExport.filename}</p>
                    <p>{lastExport.date.toLocaleString()}</p>
                    <p className="flex items-center gap-2 text-indigo-200">
                      <HardDrive className="h-4 w-4" /> {formatBytes(lastExport.size)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-indigo-200">
                    Aún no se ha generado un respaldo durante esta sesión.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
              <DownloadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Respaldo inmediato</h3>
              <p className="text-sm text-gray-500">Genera y descarga el respaldo al instante, sin procesos manuales.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Seguro y consistente</h3>
              <p className="text-sm text-gray-500">Respetamos estructuras, índices y datos para restauraciones confiables.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-100 p-3 text-slate-600">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Historial rápido</h3>
              <p className="text-sm text-gray-500">Consulta el último respaldo generado para mantener control total.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-indigo-200 bg-white p-8 shadow-inner">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Generar copia de seguridad</h3>
            <p className="mt-2 max-w-xl text-sm text-gray-500">
              El sistema compila la estructura completa de la base de datos junto con todos los registros actuales. Descarga el respaldo y almacénalo en un lugar seguro.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <button
              type="button"
              onClick={handleExport}
              disabled={loading || !token}
              className={`group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading || !token
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-400'
              }`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Preparando respaldo...
                </>
              ) : (
                <>
                  <DownloadCloud className="h-4 w-4 transition group-hover:translate-y-0.5" />
                  Descargar respaldo
                </>
              )}
            </button>
          </div>
        </div>

        {(error || success) && (
          <div className="mt-6 w-full md:w-3/4">
            {error ? (
              <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : (
              <p className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
