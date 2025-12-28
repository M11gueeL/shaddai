import React from 'react';
import { AlertCircle, Calendar, Package, Filter } from 'lucide-react';

export default function ExpiringItemRow({ item }) {
  const { status, daysLeft, batch_number, quantity } = item;
  
  // Determine visual style based on daysLeft if status is generic 'upcoming'
  let displayStatus = status;
  if (status === 'upcoming') {
      if (daysLeft <= 30) displayStatus = 'soon';
      else if (daysLeft <= 60) displayStatus = 'medium';
      else displayStatus = 'long';
  }

  const statusConfig = {
    expired: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: 'VENCIDO' },
    urgent: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', label: 'URGENTE' },
    soon: { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', label: '30 DÍAS' },
    medium: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', label: '30-60 DÍAS' },
    long: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700', label: '> 60 DÍAS' },
  };

  const config = statusConfig[displayStatus] || statusConfig.long;

  return (
    <div className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group ${status === 'expired' ? 'bg-red-50/30' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.badge}`}>
        {status === 'expired' ? <AlertCircle size={20} /> : <Calendar size={20} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-gray-900 truncate pr-2">{item.name}</h4>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${config.badge}`}>
            {status === 'expired' ? `Hace ${Math.abs(daysLeft)} días` : `${daysLeft} días`}
          </span>
        </div>
        
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Package size={14} />
            Stock Lote: <strong className="text-gray-700">{quantity}</strong> {item.unit_of_measure}
          </span>
          {batch_number && (
            <span className="flex items-center gap-1.5">
                <Filter size={14} />
                Lote: <strong className="text-gray-700">{batch_number}</strong>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            Vence: <span className="font-medium">{item.expDateObj ? item.expDateObj.toLocaleDateString() : new Date(item.expiration_date + 'T00:00:00').toLocaleDateString()}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
