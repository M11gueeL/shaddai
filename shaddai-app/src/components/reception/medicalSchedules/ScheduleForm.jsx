import { useEffect, useState } from 'react';
import { Save, X, Calendar, Clock, FileText, Stethoscope, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import api from '../../../api/medicalSchedules';
import DoctorSelector from '../appointments/DoctorSelector';

const days = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

export default function ScheduleForm({ initial = null, onCancel, onSaved }) {
    const isEdit = !!initial?.id;
    const { token, hasRole } = useAuth();
    const toast = useToast();

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [day, setDay] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (!initial) return;
        // Try to prefill doctor from initial.medical_name
        let doc = null;
        if (initial.medical_id) {
            const parts = (initial.medical_name || '').split(' ');
            doc = { id: initial.medical_id, first_name: parts[0] || '', last_name: parts.slice(1).join(' ') };
        }
        setSelectedDoctor(doc);
        setDay(String(initial.day_of_week || ''));
        setStart((initial.start_time || '').slice(0, 5));
        setEnd((initial.end_time || '').slice(0, 5));
        setNotes(initial.notes || '');
    }, [initial]);

    const canEdit = hasRole(['admin']);

    const validate = () => {
        if (!selectedDoctor?.id) return 'Seleccione un médico';
        if (!day) return 'Seleccione el día';
        if (!start || !end) return 'Ingrese la hora de inicio y fin';
        if (end <= start) return 'La hora fin debe ser mayor a la hora inicio';
        return null;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setTouched({ doctor: true, day: true, start: true, end: true });
        
        if (!canEdit) return;
        const err = validate();
        if (err) { 
            toast.warning(err); 
            return; 
        }

        const payload = {
            medical_id: selectedDoctor.id,
            day_of_week: Number(day),
            start_time: start,
            end_time: end,
            notes: notes || null,
        };

        try {
            setSaving(true);
            if (isEdit) {
                await api.update(initial.id, payload);
                toast.success('Horario actualizado exitosamente');
            } else {
                await api.create(payload);
                toast.success('Horario creado exitosamente');
            }
            onSaved?.();
        } catch (e) {
            toast.error(e?.response?.data?.error || 'No se pudo guardar el horario');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {isEdit ? 'Editar Horario Médico' : 'Nuevo Horario Médico'}
                        </h3>
                        <p className="text-xs text-gray-500">Configure la disponibilidad semanal</p>
                    </div>
                </div>
                <button 
                    type="button" 
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" 
                    onClick={onCancel}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Doctor Selection */}
                <div className="group">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                        Médico <span className="text-red-500">*</span>
                    </label>
                    <DoctorSelector 
                        selectedDoctor={selectedDoctor} 
                        onSelect={setSelectedDoctor}
                        error={touched.doctor && !selectedDoctor?.id ? 'Requerido' : null}
                    />
                     {touched.doctor && !selectedDoctor?.id && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Seleccione un médico
                        </p>
                    )}
                </div>

                {/* Day Selection */}
                <div className="group">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                        Día de la semana <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <select 
                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 bg-gray-50 border-gray-200 ${
                                touched.day && !day ? 'border-red-500 bg-red-50' : ''
                            }`} 
                            value={day} 
                            onChange={(e) => setDay(e.target.value)}
                        >
                            <option value="">Seleccione un día...</option>
                            {days.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Hora Inicio <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input 
                                type="time" 
                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 bg-gray-50 border-gray-200 ${
                                    touched.start && !start ? 'border-red-500 bg-red-50' : ''
                                }`}
                                value={start} 
                                onChange={(e) => setStart(e.target.value)} 
                            />
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Hora Fin <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input 
                                type="time" 
                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 bg-gray-50 border-gray-200 ${
                                     touched.end && !end ? 'border-red-500 bg-red-50' : ''
                                }`}
                                value={end} 
                                onChange={(e) => setEnd(e.target.value)} 
                            />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="group">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                        Notas Adicionales
                    </label>
                     <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                            <FileText className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <textarea 
                            rows={3} 
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 bg-gray-50 border-gray-200 resize-none" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            placeholder="Instrucciones específicas (Opcional)" 
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    disabled={saving || !canEdit} 
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:shadow-none transition-all text-sm font-bold flex items-center gap-2"
                >
                    <Save className="w-4 h-4" /> 
                    {saving ? 'Guardando...' : 'Guardar Horario'}
                </button>
            </div>
        </form>
    );
}
