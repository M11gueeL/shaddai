import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ 
  open, 
  title, 
  description, 
  icon: Icon, 
  iconColor = 'indigo', 
  children, 
  onClose, 
  maxWidth = 'max-w-xl', 
  hideCloseButton = false 
}) {
  if (!open) return null;

  const widthClass = maxWidth || 'max-w-xl';

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center sm:items-start px-4 py-6 sm:py-10" 
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={(e) => {
            e.stopPropagation();
            onClose();
        }} 
      />

      <div 
        className={`relative z-[1000] w-full ${widthClass} mx-auto pointer-events-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
          
          {(title || Icon || description) && (
            <div className={`mb-6 pb-4 border-b border-gray-100 flex items-start justify-between ${!Icon ? 'items-center' : ''}`}>
              <div>
                <div className={`flex items-center gap-2 ${description ? 'mb-1' : ''}`}>
                  {Icon && (
                    <div className={`p-2 bg-${iconColor}-50 rounded-lg text-${iconColor}-600`}>
                      <Icon size={20} />
                    </div>
                  )}
                  {title && <h2 className="text-xl font-bold text-gray-900 leading-tight">{title}</h2>}
                </div>
                {description && <p className={`text-sm text-gray-500 ${Icon ? 'ml-11' : ''}`}>{description}</p>}
              </div>

              {!hideCloseButton && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }} 
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
