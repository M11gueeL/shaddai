import React from 'react';
import { Edit2, Trash2, Check, Filter } from 'lucide-react';

export default function RoomsTable({ rooms, specialties, isLoading, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm tracking-wide">CONSULTORIO</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm tracking-wide">COLOR</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm tracking-wide w-1/3">ESPECIALIDADES</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm tracking-wide text-center">ESTADO</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm tracking-wide text-right">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                    Cargando datos...
                                </td>
                            </tr>
                        ) : rooms.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Filter className="w-8 h-8 text-gray-300" />
                                        <p>No se encontraron consultorios</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            rooms.map((room) => {
                                const isFullUse = room.specialties && specialties.length > 0 && room.specialties.length === specialties.length;
                                const displayedSpecialties = room.specialties || [];
                                const showMore = displayedSpecialties.length > 3 && !isFullUse;
                                
                                return (
                                    <tr key={room.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 align-top">
                                            <div>
                                                <p className="font-bold text-gray-800 text-base mb-0.5">{room.name}</p>
                                                {room.description && (
                                                    <p className="text-sm text-gray-500 line-clamp-1">{room.description}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                                                    style={{ backgroundColor: room.color }}
                                                />
                                                <span className="text-xs font-mono text-gray-500 uppercase">{room.color}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            {isFullUse ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-md border border-emerald-100">
                                                    <Check size={14} className="stroke-[3]" />
                                                    Uso General
                                                </span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {displayedSpecialties.length > 0 ? (
                                                        <>
                                                            {displayedSpecialties.slice(0, 3).map((s, idx) => (
                                                                <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded border border-indigo-100/50">
                                                                    {s.name}
                                                                </span>
                                                            ))}
                                                            {showMore && (
                                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium border border-gray-200" title={displayedSpecialties.slice(3).map(s => s.name).join(', ')}>
                                                                    +{displayedSpecialties.length - 3}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">Sin asignar</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                room.active == 1 
                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {room.active == 1 ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            <div className="flex justify-end gap-1 opacity-100">
                                                <button 
                                                    onClick={() => onEdit(room)}
                                                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => onDelete(room.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
