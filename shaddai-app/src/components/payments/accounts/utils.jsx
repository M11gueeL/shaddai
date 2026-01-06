import React from 'react';

export function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pendiente', classes: 'text-amber-700 bg-amber-50 border-amber-200' },
    partially_paid: { label: 'Parcial', classes: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    paid: { label: 'Pagada', classes: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    cancelled: { label: 'Anulada', classes: 'text-slate-700 bg-slate-100 border-slate-200' },
    pending_verification: { label: 'Por verificar', classes: 'text-sky-700 bg-sky-50 border-sky-200' }
  };
  const m = map[status] || { label: status, classes: 'text-gray-700 bg-gray-50 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${m.classes}`}>
       {m.label}
    </span>
  );
}

export function HistoryIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" /><path d="M3 3v9h9" /><path d="M12 7v5l4 2" /></svg>
}
