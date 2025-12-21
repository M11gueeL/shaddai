import React, { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X, Check, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const location = useLocation();

  // Determine position based on route
  // Login/Public routes -> Top Right (top-4)
  // App routes -> Below Header (top-24)
  const isPublicRoute = ['/login', '/register', '/forgot-password', '/'].includes(location.pathname) || location.pathname.startsWith('/reset-password');
  const positionClass = isPublicRoute ? 'top-4' : 'top-24';

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
      <div className={`fixed ${positionClass} right-4 z-[100] space-y-4 w-full max-w-sm pointer-events-none`}>
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
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgIcon: 'bg-emerald-100',
    border: 'border-emerald-500',
    progress: 'bg-emerald-500',
    shadow: 'shadow-emerald-500/10',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgIcon: 'bg-blue-100',
    border: 'border-blue-500',
    progress: 'bg-blue-500',
    shadow: 'shadow-blue-500/10',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgIcon: 'bg-amber-100',
    border: 'border-amber-500',
    progress: 'bg-amber-500',
    shadow: 'shadow-amber-500/10',
  },
  error: {
    icon: XCircle,
    color: 'text-rose-600',
    bgIcon: 'bg-rose-100',
    border: 'border-rose-500',
    progress: 'bg-rose-500',
    shadow: 'shadow-rose-500/10',
  },
};

function ToastItem({ toast, onClose }) {
  const { message, variant = 'info', duration = 3500 } = toast;
  const style = variantStyles[variant] || variantStyles.info;
  const Icon = style.icon;
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 400);
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, duration - 400);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  return (
    <div 
      className={`
        pointer-events-auto relative overflow-hidden
        bg-white
        rounded-2xl
        shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${style.shadow}
        border border-gray-100
        transform transition-all duration-500 ease-out
        ${isExiting ? 'translate-x-[120%] opacity-0' : 'translate-y-0 opacity-100'}
        animate-in slide-in-from-top-full fade-in zoom-in-95 duration-500
        group
      `}
    >
      <div className="p-4 pl-5 flex items-center gap-4">
        {/* Icon with soft background */}
        <div className={`p-2.5 rounded-full ${style.bgIcon} shrink-0 transition-transform group-hover:scale-110 duration-300`}>
          <Icon className={`w-5 h-5 ${style.color}`} strokeWidth={2.5} />
        </div>
        
        <div className="flex-1 py-1">
          <p className="text-[0.925rem] font-medium text-gray-700 leading-snug tracking-wide">
            {message}
          </p>
        </div>

        <button 
          onClick={handleClose}
          className="shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar - Bottom Line Effect */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-50">
          <div 
            className={`h-full ${style.progress} origin-left`}
            style={{ 
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
