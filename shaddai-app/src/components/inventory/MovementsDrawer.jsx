import React, { useMemo, useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Loader2, CalendarDays, Filter } from 'lucide-react';

// Helper para agrupar por día (YYYY-MM-DD)
function groupByDate(rows) {
  return rows.reduce((acc, r) => {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});
}

function prettyDateLabel(iso) {
  const today = new Date();
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const isToday = date.toDateString() === today.toDateString();
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  const isYesterday = date.toDateString() === yest.toDateString();
  if (isToday) return 'Hoy';
  if (isYesterday) return 'Ayer';
  return date.toLocaleDateString();
}

export default function MovementsDrawer({ open, item, movements, loading, onClose }) {
  const [tab, setTab] = useState('all'); // all | in | out

  const stats = useMemo(() => {
    let totalIn = 0, totalOut = 0;
    for (const m of movements) {
      const isIn = m.movement_type?.startsWith('in_');
      if (isIn) totalIn += Number(m.quantity || 0); else totalOut += Number(m.quantity || 0);
    }
    return { totalIn, totalOut };
  }, [movements]);

  const filtered = useMemo(() => {
    if (tab === 'all') return movements;
    if (tab === 'in') return movements.filter(m => m.movement_type?.startsWith('in_'));
    return movements.filter(m => !m.movement_type?.startsWith('in_'));
  }, [movements, tab]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);
  const orderedKeys = useMemo(() => Object.keys(grouped).sort((a,b) => (a < b ? 1 : -1)), [grouped]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full md:max-w-md lg:max-w-lg xl:max-w-xl bg-white h-full shadow-2xl border-l border-gray-200 flex flex-col animate-slide-in-right">
        {/* Header mejorado */}
        <div className="relative p-5 border-b overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600/10 via-purple-500/10 to-indigo-600/10" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-800">Movimientos</h3>
              <p className="text-xs text-gray-500 truncate max-w-[70vw] md:max-w-none">{item?.name}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          {/* Tabs / Filtros */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <button onClick={() => setTab('all')} className={`px-3 py-2 rounded-lg border ${tab==='all'?'bg-indigo-600 text-white border-indigo-600':'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>Todos</button>
            <button onClick={() => setTab('in')} className={`px-3 py-2 rounded-lg border ${tab==='in'?'bg-emerald-600 text-white border-emerald-600':'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>Entradas</button>
            <button onClick={() => setTab('out')} className={`px-3 py-2 rounded-lg border ${tab==='out'?'bg-rose-600 text-white border-rose-600':'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>Salidas</button>
          </div>
          {/* Resumen */}
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">↑ Entradas {stats.totalIn}</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">↓ Salidas {stats.totalOut}</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {loading && (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 border border-dashed rounded-2xl bg-white/60">
              <Filter className="w-10 h-10 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-sm">Sin movimientos para este filtro.</p>
            </div>
          )}

          {!loading && orderedKeys.map(dateKey => (
            <div key={dateKey}>
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500">{prettyDateLabel(dateKey)}</span>
              </div>

              <div className="relative pl-4">
                <div className="absolute left-1 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200" />
                <div className="space-y-3">
                  {grouped[dateKey].map(m => {
                    const isIn = m.movement_type?.startsWith('in_');
                    return (
                      <div key={m.id} className="relative rounded-xl border border-gray-200 p-3 bg-white shadow-sm">
                        <div className="absolute -left-[7px] top-4 w-3.5 h-3.5 rounded-full ring-2 ring-white border border-gray-300 bg-white" />
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isIn ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                            {isIn ? <ArrowUpCircle className="w-5 h-5 text-emerald-600" /> : <ArrowDownCircle className="w-5 h-5 text-rose-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-800 truncate">{m.movement_type}</p>
                              <span className="text-[11px] text-gray-400 shrink-0">{new Date(m.created_at).toLocaleString()}</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-600">Cantidad: <span className="font-semibold">{m.quantity}</span></div>
                            {m.notes && <p className="text-[11px] text-gray-500 mt-1">{m.notes}</p>}
                            {m.created_by && <p className="text-[11px] text-gray-400 mt-1">Por usuario #{m.created_by}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer fijo en mobile */}
        <div className="p-4 border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex justify-end">
          <button onClick={onClose} className="px-4 py-2.5 text-sm rounded-xl bg-gray-900 text-white hover:opacity-90">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
