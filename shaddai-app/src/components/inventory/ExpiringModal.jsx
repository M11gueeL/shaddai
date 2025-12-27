import React, { useMemo, useState } from 'react';
import { X, AlertTriangle, Calendar, Clock, AlertCircle, CheckCircle2, Package, Hourglass, Filter } from 'lucide-react';

export default function ExpiringModal({ isOpen, onClose, items, loading }) {
  const [filter, setFilter] = useState('all'); // all, expired, urgent, upcoming
  const [upcomingRange, setUpcomingRange] = useState(90); // 30, 60, 90

  const processedItems = useMemo(() => {
    if (!items) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items.map(item => {
      // Asegurar que la fecha se interprete como local agregando hora 00:00:00
      const dateStr = item.expiration_date.includes('T') ? item.expiration_date : `${item.expiration_date}T00:00:00`;
      const expDate = new Date(dateStr);
      
      const diffTime = expDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let status = 'upcoming';
      if (daysLeft < 0) status = 'expired';
      else if (daysLeft < 30) status = 'urgent';
      
      return { ...item, daysLeft, status, expDateObj: expDate };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return processedItems;
    if (filter === 'expired') return processedItems.filter(i => i.daysLeft < 0);
    if (filter === 'urgent') return processedItems.filter(i => i.daysLeft >= 0 && i.daysLeft < 30);
    
    if (filter === 'upcoming') {
      let min = 30;
      let max = 30;

      if (upcomingRange === 90) {
        min = 60;
        max = 90;
      } else if (upcomingRange === 60) {
        min = 30;
        max = 60;
      } else if (upcomingRange === 30) {
        min = 30;
        max = 30;
      }
      
      return processedItems.filter(i => i.daysLeft >= min && i.daysLeft <= max);
    }
    return processedItems;
  }, [processedItems, filter, upcomingRange]);

  const counts = useMemo(() => {
    // Calcular count de upcoming según el filtro seleccionado actualmente para ser consistentes
    let upcomingCount = 0;
    if (upcomingRange === 90) {
       upcomingCount = processedItems.filter(i => i.daysLeft >= 60 && i.daysLeft <= 90).length;
    } else if (upcomingRange === 60) {
       upcomingCount = processedItems.filter(i => i.daysLeft >= 30 && i.daysLeft <= 60).length;
    } else {
       upcomingCount = processedItems.filter(i => i.daysLeft >= 30 && i.daysLeft <= 30).length;
    }

    return {
      expired: processedItems.filter(i => i.status === 'expired').length,
      urgent: processedItems.filter(i => i.status === 'urgent').length,
      upcoming: upcomingCount
    };
  }, [processedItems, upcomingRange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Control de Vencimientos</h2>
            </div>
            <p className="text-sm text-gray-500 ml-11">Gestión de insumos vencidos y próximos a caducar (por Lote).</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs Toolbar */}
        <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Main Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar p-1 -ml-1">
            <FilterTab 
              active={filter === 'all'} 
              onClick={() => setFilter('all')} 
              label="Todos" 
              count={processedItems.length} 
              color="gray"
            />
            <FilterTab 
              active={filter === 'expired'} 
              onClick={() => setFilter('expired')} 
              label="Vencidos" 
              count={counts.expired} 
              color="red"
              icon={AlertCircle}
            />
            <FilterTab 
              active={filter === 'urgent'} 
              onClick={() => setFilter('urgent')} 
              label="Urgente" 
              count={counts.urgent} 
              color="orange"
              icon={Clock}
            />
            <FilterTab 
              active={filter === 'upcoming'} 
              onClick={() => setFilter('upcoming')} 
              label="Próximos" 
              count={counts.upcoming} 
              color="blue"
              icon={Calendar}
            />
          </div>

          {/* Dynamic Range Filter (Segmented Control) */}
          {filter === 'upcoming' && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300 self-end xl:self-auto ml-auto">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Ver siguientes:</span>
              <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                {[30, 60, 90].map(days => (
                  <button
                    key={days}
                    onClick={() => setUpcomingRange(days)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      upcomingRange === days 
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {days} días
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Analizando inventario...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg">Sin resultados</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-xs">
                No hay lotes para este criterio.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredItems.map((item, index) => (
                // Usamos index como key fallback porque puede haber duplicados de ID si hay varios lotes
                <ItemRow key={`${item.id}-${item.batch_number}-${index}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
          <span>Mostrando {filteredItems.length} lotes</span>
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterTab({ active, onClick, label, count, color, icon: Icon }) {
  const colors = {
    gray: active ? 'bg-gray-800 text-white shadow-lg shadow-gray-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200',
    red: active ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-red-600 hover:bg-red-50 border border-red-100',
    orange: active ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-100',
    blue: active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-100',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${colors[color]}`}
    >
      {Icon && <Icon size={16} />}
      {label}
      <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
        {count}
      </span>
    </button>
  );
}

function ItemRow({ item }) {
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
