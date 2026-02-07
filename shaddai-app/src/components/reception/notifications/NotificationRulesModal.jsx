import React, { useState, useEffect } from 'react';
import notificationRulesApi from '../../../api/notificationRules';
import { ToggleLeft, ToggleRight, Info, AlertTriangle, CheckCircle, BellOff } from 'lucide-react';

const NotificationRulesModal = ({ isOpen, onClose, userRole }) => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Estado para "Apagado General"
    // Si ninguna regla tiene is_active=1, entonces isGlobalOff es true.
    const isGlobalOff = rules.length > 0 && rules.every(r => r.is_active == 0);

    useEffect(() => {
        if (isOpen && userRole === 'admin') {
            fetchRules();
        }
    }, [isOpen, userRole]);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const response = await notificationRulesApi.getAll();
            // Aseguramos que rules siempre sea un array
            const data = Array.isArray(response.data) ? response.data : [];
            setRules(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar las reglas');
            setRules([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRule = async (selectedRule) => {
        // Si ya está activa y la clickeo, la desactivo (y queda todo apagado)
        if (selectedRule.is_active == 1) {
             handleDisableAll();
             return;
        }

        try {
            // Optimistic update local
            // Desmarcamos todas, marcamos la seleccionada
            const updatedRules = rules.map(r => ({
                ...r,
                is_active: r.id === selectedRule.id ? 1 : 0
            }));
            setRules(updatedRules);

            // API Call: Al enviar is_active=1, el backend se encarga de desactivar las demás por seguridad
            // Pero como la UI es quien manda, enviamos la actualización de la Regla seleccionada.
            await notificationRulesApi.update(selectedRule.id, { is_active: 1 });
        } catch (err) {
            console.error(err);
            setError('Error al activar la regla');
            fetchRules(); // Revertir en caso de error
        }
    };

    const handleDisableAll = async () => {
         // Encuentra la que está activa (si hay) para desactivarla
         const activeRule = rules.find(r => r.is_active == 1);
         // Si no hay ninguna activa, no hacemos nada (ya está off)
         if (!activeRule) return;

         try {
             // Optimistic Update
             const updatedRules = rules.map(r => ({ ...r, is_active: 0 }));
             setRules(updatedRules);
             
             // API Call para desactivar la que estaba activa
             await notificationRulesApi.update(activeRule.id, { is_active: 0 });
         } catch (err) {
             console.error(err);
             setError('Error al desactivar notificaciones');
             fetchRules();
         }
    };

    if (!isOpen || userRole !== 'admin') return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">
                            Configuración de Recordatorios
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                           Control del envío automático de correos 
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                             <AlertTriangle className="w-4 h-4"/> {error}
                        </div>
                    )}

                    {/* Estado Actual / Interruptor Global */}
                    <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                         <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                         <div>
                             <p className="text-sm text-blue-800 font-medium">Nota Importante</p>
                             <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                                Solo puede existir <strong>una regla activa</strong> a la vez. Al activar una opción (ej. 1 Hora antes), automáticamente se desactivará cualquier otra regla previa.
                             </p>
                         </div>
                    </div>

                    <div className="mb-6">
                        <div 
                            onClick={isGlobalOff ? undefined : handleDisableAll}
                            className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 group ${
                                isGlobalOff 
                                ? 'border-red-500 bg-red-50 ring-1 ring-red-500/20 cursor-default shadow-sm' 
                                : 'border-gray-200 hover:border-red-200 hover:bg-red-50/50 cursor-pointer'
                            }`}
                        >
                            <div className={`p-3 rounded-full mr-4 transition-colors ${
                                isGlobalOff 
                                ? 'bg-white text-red-500 shadow-sm border border-red-100' 
                                : 'bg-gray-100 text-gray-400 group-hover:bg-red-100 group-hover:text-red-500'
                            }`}>
                                <BellOff className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold text-lg ${isGlobalOff ? 'text-red-700' : 'text-gray-700'}`}>
                                    Apagar envío de recordatorios
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {isGlobalOff 
                                        ? "El envío automático está completamente detenido." 
                                        : "Actualmente se están enviando correos. Click para detener."}
                                </p>
                            </div>
                            <div className="ml-2">
                                {isGlobalOff && <CheckCircle className="w-8 h-8 text-red-500" />}
                            </div>
                        </div>
                    </div>

                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1 pb-2">
                        Reglas Disponibles (Selecciona una)
                    </h4>

                    {loading ? (
                         <div className="space-y-3">
                             {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
                         </div>
                    ) : (
                        <div className="space-y-2">
                            {rules.map(rule => (
                                <div 
                                    key={rule.id} 
                                    onClick={() => handleSelectRule(rule)}
                                    className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 select-none ${
                                        rule.is_active == 1
                                        ? 'border-indigo-500 bg-indigo-50 shadow-md ring-1 ring-indigo-500/20 z-10' 
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm opacity-90 hover:opacity-100'
                                    }`}
                                >
                                    {/* Indicador visual tipo radio */}
                                    <div className={`w-5 h-5 rounded-full border flex flex-shrink-0 items-center justify-center mr-3 transition-colors ${
                                        rule.is_active == 1
                                        ? 'border-indigo-600 bg-indigo-600' 
                                        : 'border-gray-300 bg-white'
                                    }`}>
                                        {rule.is_active == 1 && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className={`block font-semibold ${rule.is_active == 1 ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                {rule.name}
                                            </span>
                                            
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all shadow-sm"
                    >
                        Cerrar Panel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationRulesModal;
