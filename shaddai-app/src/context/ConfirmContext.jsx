import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setModal({
        title: options?.title || 'Confirmar acción',
        message: options?.message || '¿Estás seguro de continuar?',
        confirmText: options?.confirmText || 'Sí',
        cancelText: options?.cancelText || 'No',
        tone: options?.tone || 'warning',
        resolve,
      });
    });
  }, []);

  const handleClose = (value) => {
    if (modal?.resolve) modal.resolve(value);
    setModal(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {modal && (
        <ConfirmDialog
          {...modal}
          onCancel={() => handleClose(false)}
          onConfirm={() => handleClose(true)}
        />
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
};

function ConfirmDialog({ title, message, confirmText, cancelText, tone = 'warning', onCancel, onConfirm }) {
  const toneClasses = tone === 'danger' || tone === 'warning'
    ? { badge: 'bg-red-100 text-red-700', icon: 'text-red-600', button: 'bg-red-600 hover:bg-red-700' }
    : { badge: 'bg-yellow-100 text-yellow-700', icon: 'text-yellow-600', button: 'bg-yellow-600 hover:bg-yellow-700' };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 transition-all duration-200">
        <div className="flex items-start gap-3">
          <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${toneClasses.badge}`}>Confirmación</div>
          <button onClick={onCancel} className="ml-auto p-1 rounded hover:bg-black/5">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <AlertTriangle className={`w-6 h-6 ${toneClasses.icon} shrink-0 mt-0.5`} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 mt-1 text-sm">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{cancelText}</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-lg ${toneClasses.button}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
