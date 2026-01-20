import React from 'react';
import { Edit2, Trash2, Award, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SpecialtiesTable({ 
    data, 
    isLoading, 
    onEdit, 
    onDelete,
    currentPage,
    totalPages,
    onPageChange,
    totalItems
}) {
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Cargando especialidades...</div>;
    }

    if (!data || data.length === 0) {
        return (
            <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Award className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No hay especialidades</h3>
                <p className="text-gray-500">Intenta ajustar tu búsqueda o crea una nueva.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            <th className="p-4 w-full">Nombre de la Especialidad</th>
                            <th className="p-4 text-right min-w-[120px]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <Award size={18} />
                                        </div>
                                        <span className="font-medium text-gray-900 text-lg">{item.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/30 rounded-b-xl">
                    <span className="text-sm text-gray-500">
                        Total: <strong>{totalItems}</strong> especialidades
                    </span>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        <span className="text-sm font-medium text-gray-700 px-2">
                            Página {currentPage} de {totalPages}
                        </span>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}