import React from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, color, action, alert }) {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100 group-hover:ring-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100 group-hover:ring-emerald-200',
    rose: 'bg-rose-50 text-rose-600 ring-rose-100 group-hover:ring-rose-200',
    sky: 'bg-sky-50 text-sky-600 ring-sky-100 group-hover:ring-sky-200',
  };
  
  const c = colorStyles[color] || colorStyles.indigo;

  return (
    <div className={`
      relative group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm 
      hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300
    `}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${c} transition-colors`}>
          <Icon className="w-6 h-6" />
        </div>
        {alert && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
            <AlertCircle className="w-3 h-3" />
            Requerido
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
        <p className="text-sm text-gray-400 font-medium">{subtitle}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50">
        <button 
          onClick={action.onClick}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 hover:text-indigo-600 group-hover:px-2 transition-all"
        >
          {action.label}
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
        </button>
      </div>
    </div>
  );
}
