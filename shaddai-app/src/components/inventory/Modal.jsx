import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose, maxWidth = 'max-w-xl' }) {
  if (!open) return null;

  const widthClass = maxWidth || 'max-w-xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-start px-4 py-6 sm:py-10">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative z-10 w-full ${widthClass} mx-auto`}>
        
        <div className="max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <button 
              onClick={onClose} 
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {children}
        </div>

      </div>
    </div>
  );
}