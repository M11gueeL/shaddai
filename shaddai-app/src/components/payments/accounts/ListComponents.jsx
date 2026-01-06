import React from 'react';
import { Package, Trash2 } from 'lucide-react';

export function TabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button 
      onClick={onClick} 
      className={`
        flex items-center gap-2 py-4 border-b-2 transition-all min-w-max
        ${active ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}
      `}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : ''}`} />
      <span className="font-medium">{label}</span>
      {count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

export function ItemRow({ title, qty, price, total, onDelete }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
      <div className="min-w-0 pr-4 flex-1">
        <div className="font-semibold text-gray-900 truncate">{title}</div>
        <div className="text-xs text-gray-400 mt-0.5 flex gap-2">
           <span className="shrink-0">Can: {qty}</span>
           <span>•</span>
           <span className="shrink-0">Unit: ${Number(price).toFixed(2)}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
         <div className="font-bold text-gray-900">${Number(total).toFixed(2)}</div>
         {onDelete && (
           <button onClick={onDelete} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
             <Trash2 className="w-4 h-4" />
           </button>
         )}
      </div>
    </div>
  );
}

export function EmptyState({ label }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
       <Package className="w-10 h-10 mb-3 opacity-20" />
       <p className="text-sm">{label}</p>
    </div>
  );
}
