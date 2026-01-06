import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function ActionTile({ title, desc, icon: Icon, onClick, variant = 'default', delay = 0 }) {
  const isPrimary = variant === 'primary';
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group text-left
        ${isPrimary 
          ? 'bg-gray-900 border-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20' 
          : 'bg-white border-gray-100 text-gray-900 hover:border-gray-300 hover:shadow-md'
        }
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`
        p-3 rounded-xl transition-transform duration-300 group-hover:scale-110
        ${isPrimary ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-600 group-hover:bg-gray-100'}
      `}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className={`text-xs mt-0.5 ${isPrimary ? 'text-gray-300' : 'text-gray-500'}`}>{desc}</div>
      </div>
      <div className={`ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${isPrimary ? 'text-white' : 'text-gray-400'}`}>
        <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  );
}
