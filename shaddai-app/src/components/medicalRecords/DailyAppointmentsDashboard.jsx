import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, ChevronRight, Stethoscope, AlertCircle, CheckCircle2, XCircle, Clock3, ArrowRight } from 'lucide-react';
import appointmentsApi from '../../api/appointments';
import { useAuth } from '../../context/AuthContext';

export default function DailyAppointmentsDashboard({ onSelectPatient }) {
    const { token, user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDaily = async () => {
            try {
                const res = await appointmentsApi.getMyDaily(token);
                setAppointments(res.data.appointments || []);
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar las citas del día.');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchDaily();
    }, [token]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completada': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'cancelada': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'programada': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completada': return <CheckCircle2 className="w-3.5 h-3.5" />;
            case 'cancelada': return <XCircle className="w-3.5 h-3.5" />;
            case 'programada': return <Clock3 className="w-3.5 h-3.5" />;
            default: return <AlertCircle className="w-3.5 h-3.5" />;
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-400 font-medium animate-pulse">Cargando agenda...</p>
                </div>
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 min-h-[500px] animate-in fade-in duration-700">
                <div className="relative group mb-8">
                    <div className="absolute inset-0 bg-emerald-100 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                    <div className="relative flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 group-hover:scale-105 transition-transform duration-500">
                        <Calendar className="w-10 h-10 text-emerald-500/80" strokeWidth={1.5} />
                        <div className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full shadow-lg border border-slate-50">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                </div>
                <h3 className="text-2xl font-light text-slate-800 mb-2">Todo despejado por hoy</h3>
                <p className="text-slate-500 text-center max-w-xs leading-relaxed">
                    No tienes citas programadas para el día de hoy. <br/>
                    <span className="text-sm text-slate-400">¡Disfruta tu tiempo libre!</span>
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-blue-50 rounded-xl text-blue-600">
                            <Calendar className="w-6 h-6" />
                        </span>
                        Agenda del Día
                    </h2>
                    <p className="text-slate-500 mt-1 ml-14">
                        Tienes <span className="font-semibold text-slate-700">{appointments.length}</span> citas programadas para hoy
                    </p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Fecha</p>
                    <p className="text-lg font-semibold text-slate-700">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {appointments.map((apt, index) => (
                    <div 
                        key={apt.id}
                        className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:border-blue-100/50 transition-all duration-300 relative overflow-hidden cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => onSelectPatient(apt.patient_id)}
                    >
                        {/* Hover Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Content */}
                        <div className="relative z-10 space-y-4">
                            {/* Top Row: Time & Status */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span className="font-semibold text-sm">
                                        {apt.appointment_time?.substring(0, 5)}
                                    </span>
                                </div>
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>
                                    {getStatusIcon(apt.status)}
                                    <span className="capitalize">{apt.status}</span>
                                </span>
                            </div>

                            {/* Patient Info */}
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors line-clamp-1">
                                    {apt.patient_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                    <User className="w-3.5 h-3.5" />
                                    <span>{apt.patient_cedula}</span>
                                </div>
                            </div>

                            {/* Reason / Notes */}
                            {(apt.chief_complaint || apt.notes) && (
                                <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 border border-slate-100 group-hover:bg-white/80 group-hover:border-blue-50 transition-colors">
                                    <p className="line-clamp-2 italic">
                                        "{apt.chief_complaint || apt.notes}"
                                    </p>
                                </div>
                            )}

                            {/* Footer Action */}
                            <div className="pt-2 flex items-center justify-end border-t border-slate-50 mt-2">
                                <span className="text-xs font-medium text-blue-600 flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                    Ver Historia <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
