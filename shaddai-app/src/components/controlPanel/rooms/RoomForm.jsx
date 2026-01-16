import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function RoomForm({ initialData, specialties, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        specialties: [],
        active: true,
        isGeneral: false
    });

    useEffect(() => {
        if (initialData) {
            const roomSpecialtyIds = initialData.specialties ? initialData.specialties.map(s => s.id) : [];
            const isAllSelected = specialties.length > 0 && roomSpecialtyIds.length === specialties.length;
            
            setFormData({
                name: initialData.name,
                description: initialData.description || '',
                color: initialData.color || '#3B82F6',
                specialties: roomSpecialtyIds,
                active: initialData.active == 1,
                isGeneral: isAllSelected
            });
        } else {
            setFormData({
                name: '',
                description: '',
                color: '#3B82F6',
                specialties: [],
                active: true,
                isGeneral: false
            });
        }
    }, [initialData, specialties]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleGeneralToggle = (checked) => {
        if (checked) {
            setFormData(prev => ({
                ...prev,
                isGeneral: true,
                specialties: specialties.map(s => s.id)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                isGeneral: false,
                specialties: []
            }));
        }
    };

    const handleSpecialtyToggle = (specialtyId) => {
        setFormData(prev => {
            const current = prev.specialties || [];
            let newSpecialties;
            
            if (current.includes(specialtyId)) {
                newSpecialties = current.filter(id => id !== specialtyId);
            } else {
                newSpecialties = [...current, specialtyId];
            }
            
            const isAllSelected = newSpecialties.length === specialties.length && specialties.length > 0;
            
            return { 
                ...prev, 
                specialties: newSpecialties,
                isGeneral: isAllSelected
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {initialData ? 'Editar Consultorio' : 'Nuevo Consultorio'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Información y configuración del espacio
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Body - Scrollable */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <form id="roomForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name Column */}
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Consultorio</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Ej: Consultorio 101"
                                    required
                                />
                            </div>

                            {/* Color Column */}
                            <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Color Identificador</label>
                                    <div className="flex items-center gap-3 p-1.5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors cursor-pointer group">
                                    <input
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                                    />
                                    <span className="text-sm font-mono text-gray-600 group-hover:text-gray-900">{formData.color}</span>
                                    </div>
                            </div>

                            {/* Description - Full Width */}
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-gray-400"
                                    rows="2"
                                    placeholder="Detalles sobre el equipamiento o ubicación..."
                                />
                            </div>

                            {/* Specialties Section - Full Width */}
                            <div className="col-span-2 bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-700">Especialidades Admitidas</span>
                                        <span className="text-xs text-gray-500 font-normal">¿Qué servicios se pueden prestar aquí?</span>
                                    </label>
                                    
                                    <label className="inline-flex items-center cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.isGeneral}
                                            onChange={(e) => handleGeneralToggle(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        <span className="ms-3 text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Uso General (Todas)</span>
                                    </label>
                                </div>

                                <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {specialties.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm">No hay especialidades registradas en el sistema.</div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {specialties.map(spec => {
                                                const isSelected = formData.specialties.includes(spec.id);
                                                return (
                                                    <label 
                                                        key={spec.id} 
                                                        className={`
                                                            relative flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-200
                                                            ${isSelected 
                                                                ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-500/10' 
                                                                : 'bg-white/50 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                                            ${formData.isGeneral ? 'opacity-70 cursor-not-allowed bg-indigo-50/30' : ''}
                                                        `}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => !formData.isGeneral && handleSpecialtyToggle(spec.id)}
                                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                            disabled={formData.isGeneral}
                                                        />
                                                        <span className={`ml-2 text-sm truncate ${isSelected ? 'font-medium text-indigo-900' : 'text-gray-600'}`}>
                                                            {spec.name}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Active Status */}
                            <div className="col-span-2">
                                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            name="active"
                                            checked={formData.active}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-700">Estado Activo</span>
                                    </label>
                                    <p className="ml-auto text-xs text-gray-400">
                                        {formData.active ? 'El consultorio será visible para agendar nuevas citas.' : 'El consultorio permanecerá oculto.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all duration-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="roomForm"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-200 transform transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <Save size={18} strokeWidth={2.5} />
                        {initialData ? 'Guardar Cambios' : 'Crear Consultorio'}
                    </button>
                </div>
            </div>
        </div>
    );
}
