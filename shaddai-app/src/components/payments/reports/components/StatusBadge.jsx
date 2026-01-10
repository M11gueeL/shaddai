import React from 'react';

export default function StatusBadge({ status }) {
    const lookup = {
        'verified': { text: 'Verificado', class: 'bg-emerald-100 text-emerald-700' },
        'approved': { text: 'Aprobado', class: 'bg-emerald-100 text-emerald-700' },
        'active': { text: 'Activo', class: 'bg-blue-100 text-blue-700' },
        'annulled': { text: 'Anulado', class: 'bg-red-100 text-red-700 line-through' },
        'pending': { text: 'Pendiente', class: 'bg-amber-100 text-amber-700' },
        'rejected': { text: 'Rechazado', class: 'bg-red-50 text-red-600' },
        'open': { text: 'Abierta', class: 'bg-green-100 text-green-700' },
        'closed': { text: 'Cerrada', class: 'bg-gray-100 text-gray-700' }
    };
    
    const conf = lookup[status] || { text: status, class: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${conf.class}`}>
            {conf.text}
        </span>
    );
};
