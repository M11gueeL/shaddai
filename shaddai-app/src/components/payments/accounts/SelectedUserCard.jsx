import React from 'react';
import { XCircle } from 'lucide-react';

export default function SelectedUserCard({ user, onRemove, label, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
          <Icon className="w-4 h-4" />
        </div>
        <div>
           <div className="text-sm font-semibold text-gray-900">{user.full_name}</div>
           <div className="text-[10px] uppercase font-bold text-indigo-400">{label}</div>
        </div>
      </div>
      <button onClick={onRemove} className="p-1.5 hover:bg-white rounded-lg text-indigo-400 hover:text-indigo-600 transition-colors">
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
}
