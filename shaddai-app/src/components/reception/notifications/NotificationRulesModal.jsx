import React, { useState, useEffect } from 'react';
import notificationRulesApi from '../../../api/notificationRules';
import { ToggleLeft, ToggleRight, Info, AlertTriangle, CheckCircle, BellOff, History, Calendar, User, Stethoscope, Mail, RefreshCw } from 'lucide-react';

const NotificationRulesModal = ({ isOpen, onClose, userRole }) => {
    // Estados para Configuración
    const [rules, setRules] = useState([]);
    const [loadingRules, setLoadingRules] = useState(false);
    const [errorRules, setErrorRules] = useState('');

    // Estados para Historial
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [errorHistory, setErrorHistory] = useState('');

    const isGlobalOff = rules.length > 0 && rules.every(r => r.is_active == 0);

    useEffect(() => {
        if (isOpen && userRole === 'admin') {
            fetchRules();
            fetchHistory();
        }
    }, [isOpen, userRole]);

    const fetchRules = async () => {
        setLoadingRules(true);
        try {
            const response = await notificationRulesApi.getAll();
            const data = Array.isArray(response.data) ? response.data : [];
            setRules(data);
        } catch (err) {
            console.error(err);
            setErrorRules('Error al cargar las reglas');
            setRules([]);
        } finally {
            setLoadingRules(false);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await notificationRulesApi.getHistory();
            const data = Array.isArray(response.data) ? response.data : [];
            setHistory(data);
        } catch (err) {
            console.error(err);
            setErrorHistory('Error al cargar el historial');
            setHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSelectRule = async (selectedRule) => {
        if (selectedRule.is_active == 1) {
             handleDisableAll();
             return;
        }

        try {
            const updatedRules = rules.map(r => ({
                ...r,
                is_active: r.id === selectedRule.id ? 1 : 0
            }));
            setRules(updatedRules);
            await notificationRulesApi.update(selectedRule.id, { is_active: 1 });
        } catch (err) {
            console.error(err);
            setErrorRules('Error al activar la regla');
            fetchRules();
        }
    };

    const handleDisableAll = async () => {
         const activeRule = rules.find(r => r.is_active == 1);
         if (!activeRule) return;

         try {
             const updatedRules = rules.map(r => ({ ...r, is_active: 0 }));
             setRules(updatedRules);
             await notificationRulesApi.update(activeRule.id, { is_active: 0 });
         } catch (err) {
             console.error(err);
             setErrorRules('Error al desactivar notificaciones');
             fetchRules();
         }
    };

    if (!isOpen || userRole !== 'admin') return null;

    // Formateador de fecha/hora simple
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[85vh]">
                
                {/* Header Común */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                             <Mail className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">
                                Gestión de Recordatorios
                            </h3>
                            <p className="text-sm text-gray-500">
                               Monitoriza y configura las notificaciones automáticas por correo
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    
                    {/* IZQUIERDA: HISTORIAL (60%) */}
                    <div className="flex-1 bg-gray-50/50 flex flex-col border-r border-gray-100 min-w-0">
                        <div className="px-6 py-4 border-b border-gray-200/60 flex justify-between items-center bg-gray-50 sticky top-0">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-gray-500" />
                                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Historial de Envíos</h4>
                                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                    {history.length}
                                </span>
                            </div>
                            <button 
                                onClick={fetchHistory} 
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                                title="Actualizar historial"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {loadingHistory ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse">
                                            <div className="flex justify-between mb-3">
                                                <div className="h-4 bg-gray-200 w-1/3 rounded"></div>
                                                <div className="h-4 bg-gray-200 w-20 rounded"></div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-3 bg-gray-100 w-1/2 rounded"></div>
                                                <div className="h-3 bg-gray-100 w-2/3 rounded"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : errorHistory ? (
                                <div className="text-center py-10 px-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-3">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <p className="text-red-600 font-medium">{errorHistory}</p>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                                    <Mail className="w-12 h-12 mb-3 opacity-20" />
                                    <p>No se han encontrado registros de envíos recientes.</p>
                                </div>
                            ) : (
                                history.map((log) => (
                                    <div key={log.log_id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                        
                                        <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs ring-2 ring-indigo-500/10 mb-0.5">
                                                    {log.patient_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm leading-tight">{log.patient_name}</p>
                                                    <p className="text-xs text-gray-400">{log.patient_email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-100">
                                                    Enviado
                                                </span>
                                                <p className="text-[10px] text-gray-400 mt-1 flex items-center justify-end gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(log.sent_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                            <div className="col-span-2 flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-lg">
                                                <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="font-semibold text-gray-700">{log.specialty_name}</span>
                                                <span className="text-gray-400 mx-1">•</span>
                                                <span className="text-gray-500">{log.doctor_name}</span>
                                            </div>
                                            <div className="bg-gray-50/50 p-1.5 rounded flex items-center gap-1.5 border border-gray-100">
                                                <span className="text-gray-400">Cita:</span>
                                                <span className="font-medium">{log.appointment_date} {log.appointment_time}</span>
                                            </div>
                                            <div className="bg-gray-50/50 p-1.5 rounded flex items-center gap-1.5 border border-gray-100">
                                                <span className="text-gray-400">Regla:</span>
                                                <span className="font-medium text-indigo-600">{log.rule_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* DERECHA: CONFIGURACIÓN (40%) */}
                    <div className="w-[420px] bg-white flex flex-col min-w-[350px] z-10 shadow-[-5px_0_15px_-5px_rgb(0,0,0,0.05)]">
                         <div className="px-6 py-4 border-b border-gray-100 bg-white sticky top-0">
                            <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
                                <ToggleRight className="w-4 h-4 text-gray-500" />
                                Configuración
                            </h4>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {errorRules && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4"/> {errorRules}
                                </div>
                            )}

                            {/* Estado Actual / Interruptor Global */}
                            <div className="mb-6 bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex flex-col gap-3">
                                <div className="flex items-start gap-2.5">
                                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-blue-800 font-bold mb-1">Funcionamiento</p>
                                        <p className="text-xs text-blue-600 leading-relaxed text-justify opacity-90">
                                            El sistema escaneará las citas periódicamente. Si seleccionas <strong>"1 Hora antes"</strong>, el correo se enviará automáticamente cuando falte 1 hora para la cita.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div 
                                    onClick={isGlobalOff ? undefined : handleDisableAll}
                                    className={`flex items-center p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                                        isGlobalOff 
                                        ? 'border-red-200 bg-red-50 cursor-default' 
                                        : 'border-gray-200 hover:border-red-300 hover:bg-white hover:shadow-md cursor-pointer'
                                    }`}
                                >
                                    <div className={`p-3 rounded-full mr-4 transition-colors z-10 ${
                                        isGlobalOff 
                                        ? 'bg-white text-red-500 shadow-sm ring-1 ring-red-100' 
                                        : 'bg-gray-100 text-gray-400 group-hover:bg-red-50 group-hover:text-red-500'
                                    }`}>
                                        <BellOff className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 z-10">
                                        <h4 className={`font-bold text-base ${isGlobalOff ? 'text-red-700' : 'text-gray-700'}`}>
                                            Detener Envíos
                                        </h4>
                                        <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                                            {isGlobalOff 
                                                ? "Servicio detenido correctamente" 
                                                : "Click para pausar todas las notificaciones"}
                                        </p>
                                    </div>
                                    {isGlobalOff && (
                                        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                                    )}
                                </div>
                            </div>

                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1 pb-2 border-b border-gray-50">
                                Reglas de Tiempo
                            </h4>

                            {loadingRules ? (
                                <div className="space-y-3">
                                    {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {rules.map(rule => (
                                        <div 
                                            key={rule.id} 
                                            onClick={() => handleSelectRule(rule)}
                                            className={`relative flex items-center p-3.5 rounded-xl border cursor-pointer transition-all duration-300 select-none group ${
                                                rule.is_active == 1
                                                ? 'border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600 z-10 ' 
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'
                                            }`}
                                        >
                                            {/* Indicador visual */}
                                            <div className={`w-5 h-5 rounded-full border-2 flex flex-shrink-0 items-center justify-center mr-3 transition-colors ${
                                                rule.is_active == 1
                                                ? 'border-indigo-600 bg-indigo-600' 
                                                : 'border-gray-300 group-hover:border-gray-400 bg-transparent'
                                            }`}>
                                                {rule.is_active == 1 && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                            </div>

                                            <div className="flex-1">
                                                <span className={`block font-semibold text-sm ${rule.is_active == 1 ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                    {rule.name}
                                                </span>
                                            </div>

                                            {rule.is_active == 1 && (
                                                <div className="absolute right-3">
                                                     <span className="flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t border-gray-100 text-xs text-gray-500">
                    <p>Sistema de Notificaciones Shaddai v2.0</p>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-800 hover:text-white hover:border-gray-800 focus:outline-none transition-all shadow-sm"
                    >
                        Cerrar Panel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationRulesModal;
