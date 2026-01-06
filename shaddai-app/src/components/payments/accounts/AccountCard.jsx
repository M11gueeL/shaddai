import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { StatusBadge } from './utils';

export default function AccountCard({ account, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col items-start text-left p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 w-full overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <FileText className="w-20 h-20 text-gray-900" />
      </div>

      <div className="flex justify-between w-full mb-4">
        <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">#{account.id}</span>
        <StatusBadge status={account.status} />
      </div>

      <div className="space-y-1 mb-6 relative z-10">
        <div className="text-lg font-bold text-gray-900 line-clamp-1">{account.patient_name}</div>
        {account.payer_name && <div className="text-sm text-gray-500">Pagador: {account.payer_name}</div>}
      </div>

      <div className="mt-auto w-full pt-4 border-t border-gray-50 flex justify-between items-center group-hover:border-gray-100 transition-colors">
        <div className="text-xs text-gray-400">{account.created_at?.split(' ')[0]}</div>
        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}
