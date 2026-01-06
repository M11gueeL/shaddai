import React from 'react';

export default function StatusBadge({ status }){
  const map = {
    open: { label: 'Abierta', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    closed: { label: 'Cerrada', cls: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200' },
    no_open_session: { label: 'Sin sesión', cls: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200' }
  };
  const m = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${m.cls}`}>{m.label}</span>;
}
