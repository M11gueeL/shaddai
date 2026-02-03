import React, { useState, useEffect } from 'react';
import notificationRulesApi from '../../../api/notificationRules';

const NotificationRulesModal = ({ isOpen, onClose, userRole }) => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newRule, setNewRule] = useState({ name: '', minutes_before: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && userRole === 'admin') {
            fetchRules();
        }
    }, [isOpen, userRole]);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const response = await notificationRulesApi.getAll();
            setRules(response.data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar las reglas');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        if (!newRule.name || !newRule.minutes_before) {
            setError('Todos los campos son obligatorios');
            return;
        }

        try {
            await notificationRulesApi.create(newRule);
            setNewRule({ name: '', minutes_before: '' });
            fetchRules();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear la regla');
        }
    };

    const handleToggle = async (rule) => {
        try {
            const newStatus = rule.is_active ? 0 : 1;
            await notificationRulesApi.update(rule.id, { is_active: newStatus });
            // Optimistic update or refresh
             setRules(rules.map(r => r.id === rule.id ? { ...r, is_active: newStatus } : r));
        } catch (err) {
            console.error(err);
            setError('Error al actualizar el estado');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta regla?')) return;
        try {
            await notificationRulesApi.delete(id);
            fetchRules();
        } catch (err) {
            setError('Error al eliminar la regla');
        }
    };

    if (!isOpen || userRole !== 'admin') return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Configuración de Recordatorios
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Lista de reglas existentes */}
                    <div className="mb-6 space-y-3">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Reglas Actuales</h4>
                        {loading && <p className="text-gray-500 text-center py-2">Cargando...</p>}
                        
                        {!loading && rules.length === 0 && (
                             <p className="text-gray-400 text-center py-2 italic">No hay reglas configuradas</p>
                        )}

                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                            {rules.map(rule => (
                                <li key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-800">{rule.name}</p>
                                        <p className="text-xs text-gray-500">{rule.minutes_before} min antes</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {/* Switch Toggle */}
                                        <button 
                                            onClick={() => handleToggle(rule)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${rule.is_active ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                        >
                                            <span className="sr-only">Use setting</span>
                                            <span 
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${rule.is_active ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>

                                        {/* Delete Button */}
                                        <button 
                                            onClick={() => handleDelete(rule.id)}
                                            className="text-red-400 hover:text-red-600 p-1"
                                            title="Eliminar regla"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Agregar nueva regla */}
                    <form onSubmit={handleCreate} className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Nueva Regla</h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                                <input
                                    type="text"
                                    placeholder="Nombre (ej. 1 Hora antes)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={newRule.name}
                                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Minutos"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={newRule.minutes_before}
                                    onChange={(e) => setNewRule({ ...newRule, minutes_before: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mt-3 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Agregar Regla
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NotificationRulesModal;
