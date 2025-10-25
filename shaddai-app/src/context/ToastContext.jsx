import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback((toast) => {
    const id = ++idCounter;
    const duration = toast.duration ?? 3500;
    const newToast = { id, ...toast };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    if (duration > 0) {
      const timer = setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, timer);
    }
    return id;
  }, [removeToast]);

  const api = useMemo(() => ({
    show: (message, opts = {}) => addToast({ message, ...opts }),
    success: (message, opts = {}) => addToast({ message, variant: 'success', ...opts }),
    info: (message, opts = {}) => addToast({ message, variant: 'info', ...opts }),
    warning: (message, opts = {}) => addToast({ message, variant: 'warning', ...opts }),
    error: (message, opts = {}) => addToast({ message, variant: 'error', ...opts }),
    remove: removeToast,
  }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast viewport */}
      <div className="fixed top-4 right-4 z-[100] space-y-3 w-[90vw] max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const variantStyles = {
  success: {
    base: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
  },
  info: {
    base: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
  },
  warning: {
    base: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
  },
  error: {
    base: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
  },
};

function ToastItem({ toast, onClose }) {
  const { message, variant = 'info' } = toast;
  const styles = variantStyles[variant] || variantStyles.info;
  const Icon = variant === 'success' ? CheckCircle
    : variant === 'warning' ? AlertTriangle
    : variant === 'error' ? XCircle
    : Info;

  return (
    <div className={`border shadow-lg rounded-xl px-4 py-3 flex items-start gap-3 transition-all duration-200 ${styles.base}`}>
      <Icon className={`w-5 h-5 mt-0.5 ${styles.icon}`} />
      <div className="text-sm text-gray-800 flex-1">{message}</div>
      <button onClick={onClose} className="p-1 rounded hover:bg-black/5">
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}
