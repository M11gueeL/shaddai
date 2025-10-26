import { Trash2, Pencil, Loader2 } from 'lucide-react';
import { formatDay } from './MedicalSchedulesPanel';

export default function SchedulesTable({ items, loading, error, canEdit, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando horarios...
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
    );
  }
  if (!items?.length) {
    return (
      <div className="p-10 text-center text-gray-500 border rounded-xl bg-white">No hay horarios para mostrar.</div>
    );
  }
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-300 bg-gray-50">
            <th className="px-4 py-3">Médico</th>
            <th className="px-4 py-3">Día</th>
            <th className="px-4 py-3">Inicio</th>
            <th className="px-4 py-3">Fin</th>
            <th className="px-4 py-3">Notas</th>
            {canEdit && <th className="px-4 py-3 text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id} className="border-b border-gray-300 last:border-0 hover:bg-gray-100">
              <td className="px-4 py-3 whitespace-nowrap">{row.medical_name || `#${row.medical_id}`}</td>
              <td className="px-4 py-3">{formatDay(row.day_of_week)}</td>
              <td className="px-4 py-3">{row.start_time?.slice(0,5)}</td>
              <td className="px-4 py-3">{row.end_time?.slice(0,5)}</td>
              <td className="px-4 py-3 max-w-[360px] truncate" title={row.notes}>{row.notes || '-'}</td>
              {canEdit && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={()=>onEdit(row)} className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1">
                      <Pencil className="w-4 h-4" /> Editar
                    </button>
                    <button onClick={()=>onDelete(row)} className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1">
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
