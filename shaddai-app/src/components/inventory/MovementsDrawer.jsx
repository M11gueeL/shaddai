import React, { useState, useMemo } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, History, Calendar, User, Filter } from 'lucide-react';

export default function MovementsDrawer({ isOpen, onClose, item, movements }) {
  const [filter, setFilter] = useState('all'); // all, in, out

  // 1. Calcular saldos históricos (Kardex Inverso) sobre TODOS los movimientos
  const movementsWithBalance = useMemo(() => {
    if (!item) return [];
    let currentBalance = Number(item.stock_quantity);
    
    return movements.map(mov => {
      const balanceSnapshot = currentBalance;
      const qty = Number(mov.quantity);
      
      // Revertir para el siguiente paso (hacia el pasado)
      if (mov.movement_type.startsWith('in_')) {
        currentBalance -= qty;
      } else {
        currentBalance += qty;
      }

      return { ...mov, balanceSnapshot };
    });
  }, [movements, item]);

  // 2. Filtrar según selección
  const filteredMovements = useMemo(() => {
    if (filter === 'all') return movementsWithBalance;
    return movementsWithBalance.filter(m => {
      const isIn = m.movement_type.startsWith('in_');
      return filter === 'in' ? isIn : !isIn;
    });
  }, [movementsWithBalance, filter]);

  // 3. Agrupar por fecha
  const groupedMovements = useMemo(() => {
    const groups = {};
    filteredMovements.forEach(mov => {
      const date = new Date(mov.created_at);
      const dateKey = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(mov);
    });
    return groups;
  }, [filteredMovements]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">
        
        {/* Header Elegante */}
        <div className="px-6 py-5 bg-white border-b border-gray-100 flex justify-between items-start z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <History size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Kardex Digital</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                Stock: <span className="font-bold">{item.stock_quantity}</span> {item.unit_of_measure}
              </div>
              <div className="text-xs text-gray-400">
                ID: {item.code || item.id}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Filtros */}
        <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white text-gray-800 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('in')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'in' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Entradas
          </button>
          <button 
            onClick={() => setFilter('out')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'out' ? 'bg-red-50 text-red-700 ring-1 ring-red-200 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Salidas
          </button>
        </div>

        {/* Lista de Movimientos */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
          {Object.keys(groupedMovements).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Filter className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">No hay movimientos con este filtro.</p>
            </div>
          ) : (
            <div className="pb-10">
              {Object.entries(groupedMovements).map(([date, groupMoves]) => (
                <div key={date}>
                  {/* Separador de Fecha */}
                  <div className="sticky top-0 z-10 px-6 py-2 bg-gray-100/90 backdrop-blur-sm border-y border-gray-200/50 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Calendar size={12} />
                    {date}
                  </div>
                  
                  <div className="divide-y divide-gray-100 bg-white">
                    {groupMoves.map((mov) => {
                      const isIn = mov.movement_type.startsWith('in_');
                      const isRestock = mov.movement_type === 'in_restock';
                      
                      return (
                        <div key={mov.id} className="px-6 py-4 hover:bg-gray-50 transition-colors group relative">
                          <div className="flex items-start gap-4">
                            {/* Icono */}
                            <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                              isIn 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                : 'bg-red-50 border-red-100 text-red-600'
                            }`}>
                              {isIn ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownLeft size={20} strokeWidth={2.5} />}
                            </div>

                            {/* Detalles */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className={`text-sm font-bold ${isIn ? 'text-emerald-900' : 'text-red-900'}`}>
                                    {isIn ? (isRestock ? 'Abastecimiento' : 'Entrada') : 'Salida / Consumo'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                      <User size={10} /> ID: {mov.created_by}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(mov.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-lg font-bold ${isIn ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {isIn ? '+' : '-'}{mov.quantity}
                                  </p>
                                  <p className="text-xs font-mono text-gray-400 mt-0.5">
                                    Saldo: {mov.balanceSnapshot}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Notas */}
                              {mov.notes && (
                                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                                  "{mov.notes}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
