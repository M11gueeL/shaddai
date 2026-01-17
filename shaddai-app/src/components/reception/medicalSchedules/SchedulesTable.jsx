import { Trash2, Pencil, Loader2, Clock, MapPin, User, FileText } from 'lucide-react';
import { formatDay } from './MedicalSchedulesPanel';

export default function SchedulesTable({ items, loading, error, canEdit, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-xl border border-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" /> 
        <span className="font-medium">Cargando horarios...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">!</div>
        <p className="font-medium">{error}</p>
      </div>
    );
  }
  if (!items?.length) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay horarios definidos</h3>
            <p className="text-sm text-gray-500 max-w-sm">
                No se encontraron horarios médicos con los filtros seleccionados o la tabla está vacía.
            </p>
        </div>
    );
  }
  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Médico</th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Día</th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Horario</th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notas / Consultorio</th>
            {canEdit && <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">{row.medical_name}</div>
                        <div className="text-xs text-gray-500">ID: {row.medical_id}</div>
                    </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {formatDay(row.day_of_week)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{row.start_time?.slice(0,5)} - {row.end_time?.slice(0,5)}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                 <div className="flex flex-col gap-1">
                    {row.notes ? (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                            <span className="truncate max-w-[250px]" title={row.notes}>{row.notes}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400 italic">-</span>
                    )}
                 </div>
              </td>
              {canEdit && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={()=>onEdit(row)} 
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={()=>onDelete(row)} 
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
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
