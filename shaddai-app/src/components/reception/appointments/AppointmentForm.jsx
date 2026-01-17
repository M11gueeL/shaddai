// src/components/reception/appointments/AppointmentForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, Stethoscope, FileText, AlertCircle, X } from 'lucide-react';
import PatientSearch from './PatientSearch';
import DoctorSelector from './DoctorSelector';
import SpecialtySelector from './SpecialtySelector';
import appointmentsAPI from '../../../api/appointments';
import { getConsultingRoomsBySpecialty } from '../../../api/consultingRooms';
import schedulesAPI from '../../../api/medicalSchedules';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import TimePicker from './TimePicker';

const AppointmentForm = ({ onClose }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    office_number: '',
    specialty_id: '',
    duration: 30,
    appointment_type: 'primera_vez',
    'status': 'programada',
    chief_complaint: '',
    symptoms: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOutsidePreferred, setIsOutsidePreferred] = useState(false);
  const { confirm } = useConfirm();

  // Obtener token del localStorage
  const getToken = () => localStorage.getItem('token');

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Obtener hora mínima si es hoy
  const getMinTime = () => {
    if (formData.appointment_date === getMinDate()) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '08:00';
  };

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient_id) newErrors.patient_id = 'Paciente es requerido';
    if (!formData.doctor_id) newErrors.doctor_id = 'Médico es requerido';
    if (!formData.appointment_date) newErrors.appointment_date = 'Fecha es requerida';
    if (!formData.appointment_time) newErrors.appointment_time = 'Hora es requerida';
    if (!formData.specialty_id) newErrors.specialty_id = 'Especialidad es requerida';
    
    // Validar fecha no sea pasada
    if (formData.appointment_date && formData.appointment_date < getMinDate()) {
      newErrors.appointment_date = 'No se pueden programar citas en fechas pasadas';
    }

    // Validar hora si es hoy
    if (formData.appointment_date === getMinDate() && formData.appointment_time < getMinTime()) {
      newErrors.appointment_time = 'No se pueden programar citas en horas pasadas';
    }

    // Validar duración
    if (formData.duration < 15 || formData.duration > 60) {
      newErrors.duration = 'La duración debe estar entre 15 y 60 minutos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar selección de paciente
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patient_id: patient ? patient.id : ''
    }));
    if (errors.patient_id) {
      setErrors(prev => ({ ...prev, patient_id: '' }));
    }
  };

  // Manejar selección de doctor
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData(prev => ({
      ...prev,
      doctor_id: doctor ? doctor.id : '',
      specialty_id: '' // Reset specialty when doctor changes
    }));
    setAvailableSpecialties(doctor ? (doctor.specialties || []) : []);
    if (errors.doctor_id) {
      setErrors(prev => ({ ...prev, doctor_id: '' }));
    }
  };

  // Utilidad: convertir HH:MM a minutos
  const toMinutes = (hhmm) => {
    if (!hhmm || typeof hhmm !== 'string') return null;
    const [h, m] = hhmm.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  // Utilidad: día de la semana API (1=Lunes ... 7=Domingo)
  const apiDayOfWeek = (dateStr) => {
    if (!dateStr) return null;
    const js = new Date(dateStr).getDay(); // 0=Domingo..6=Sábado
    return ((js + 6) % 7) + 1; // -> 1..7 (Lunes..Domingo)
  };


  // Fetch rooms when specialty changes
  useEffect(() => {
    const fetchRooms = async () => {
      if (!formData.specialty_id) {
        setAvailableRooms([]);
        return;
      }
      try {
        const response = await getConsultingRoomsBySpecialty(formData.specialty_id);
        if (response.success && Array.isArray(response.data)) {
          setAvailableRooms(response.data);
          // If currently selected room is not in result, might want to reset or keep
        } else {
             setAvailableRooms([]);
        }
      } catch (error) {
        console.error("Error fetching rooms", error);
        setAvailableRooms([]);
      }
    };
    fetchRooms();
  }, [formData.specialty_id]);

  // Checar si la cita está fuera de los horarios preferidos del médico

  const checkOutsidePreferred = async () => {
    try {
      const token = getToken();
      if (!token || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
        setIsOutsidePreferred(false);
        return false;
      }

      const res = await schedulesAPI.list(token, { doctorId: formData.doctor_id });
      const schedules = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (!schedules.length) {
        setIsOutsidePreferred(true);
        return true;
      }

      const dow = apiDayOfWeek(formData.appointment_date);
      const startMin = toMinutes(formData.appointment_time);
      const endMin = startMin != null ? startMin + Number(formData.duration || 30) : null;

      const daySchedules = schedules.filter(s => Number(s.day_of_week) === Number(dow));
      if (!daySchedules.length) {
        setIsOutsidePreferred(true);
        return true;
      }

      // Debe caber completamente dentro de algún bloque
      const fits = daySchedules.some(s => {
        const sStart = toMinutes((s.start_time || '').slice(0,5));
        const sEnd = toMinutes((s.end_time || '').slice(0,5));
        if (sStart == null || sEnd == null || startMin == null || endMin == null) return false;
        return sStart <= startMin && endMin <= sEnd;
      });

      setIsOutsidePreferred(!fits);
      return !fits;
    } catch (e) {
      // Si falla la verificación, no bloqueamos; solo no marcamos advertencia
      setIsOutsidePreferred(false);
      return false;
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    setIsLoading(true);
    try {
        const token = getToken();

        const dataToSend = {
        ...formData,
        status: formData.status || 'programada' // FALLBACK
        };
        
        console.log('Data being sent:', dataToSend); // DEBUG
        // Verificar contra horarios preferidos del médico
        const outside = await checkOutsidePreferred();
        if (outside) {
          const ok = await confirm({
            title: 'Fuera del horario preferido',
            message: 'Estás agendando una cita fuera del horario preferido del médico. ¿Deseas continuar de todas formas?',
            confirmText: 'Sí, continuar',
            cancelText: 'No, volver',
            tone: 'warning',
          });
          if (!ok) {
            setIsLoading(false);
            return;
          }
        }

    const response = await appointmentsAPI.create(dataToSend, token);
    toast.success('Cita agendada exitosamente');
        onClose(); // Cerrar modal
        
    } catch (error) {
        console.error('Error creating appointment:', error);
        // MOSTRAR MÁS DETALLES DEL ERROR
        const errorMessage = error.response?.data?.error || error.message || 'Error al crear la cita';
        console.log('Full error response:', error.response?.data);
    toast.error(errorMessage);
    } finally {
        setIsLoading(false);
    }
    };

  // Indicador visual rápido (opcional) cuando ya hay selección
  useEffect(() => {
    // No bloquear: solo ajustar la banderita; evitamos llamadas si falta info
    const run = async () => {
      if (!formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
        setIsOutsidePreferred(false);
        return;
      }
      await checkOutsidePreferred();
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.doctor_id, formData.appointment_date, formData.appointment_time, formData.duration]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-auto flex flex-col h-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Header del modal */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">Agendar Nueva Cita</h2>
                <p className="text-gray-500 text-sm">Complete los datos para programar una cita médica</p>
            </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Body del Modal */}
      <div className="p-8 overflow-y-auto bg-gray-50/50 flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sección: Información Principal */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Información del Paciente y Médico
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Paciente <span className="text-red-500">*</span>
                        </label>
                         <div className="relative">
                            <PatientSearch
                                onSelect={handlePatientSelect}
                                error={errors.patient_id}
                                selectedPatient={selectedPatient}
                            />
                         </div>
                         {errors.patient_id && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.patient_id}
                            </p>
                         )}
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Médico <span className="text-red-500">*</span>
                        </label>
                        <DoctorSelector
                            onSelect={handleDoctorSelect}
                            error={errors.doctor_id}
                            selectedDoctor={selectedDoctor}
                        />
                        {errors.doctor_id && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.doctor_id}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Sección: Detalles de la Cita */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Detalles de la Cita
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="md:col-span-3 lg:col-span-1 group">
                         <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Especialidad <span className="text-red-500">*</span>
                        </label>
                        <SpecialtySelector
                            specialties={availableSpecialties}
                            value={formData.specialty_id}
                            onChange={(value) => {
                                setFormData(prev => ({ ...prev, specialty_id: value }));
                                if (errors.specialty_id) {
                                setErrors(prev => ({ ...prev, specialty_id: '' }));
                                }
                            }}
                            error={errors.specialty_id}
                            disabled={!formData.doctor_id}
                        />
                        {errors.specialty_id && (
                             <p className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.specialty_id}
                            </p>
                        )}
                    </div>

                     <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Fecha <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="date"
                                name="appointment_date"
                                value={formData.appointment_date}
                                onChange={handleInputChange}
                                min={getMinDate()}
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 ${
                                errors.appointment_date ? 'border-red-500' : 'border-gray-200'
                                }`}
                            />
                        </div>
                        {errors.appointment_date && (
                             <p className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.appointment_date}
                            </p>
                        )}
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Hora <span className="text-red-500">*</span>
                        </label>
                        <TimePicker
                            value={formData.appointment_time}
                            onChange={(t) => {
                                setFormData((prev) => ({ ...prev, appointment_time: t }));
                                if (errors.appointment_time) {
                                    setErrors((prev) => ({ ...prev, appointment_time: '' }));
                                }
                            }}
                            min={getMinTime()}
                            start="06:00"
                            end="22:00"
                            step={15}
                            error={errors.appointment_time}
                        />
                         {errors.appointment_time && (
                             <p className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.appointment_time}
                            </p>
                        )}
                        {!errors.appointment_time && isOutsidePreferred && (
                            <p className="text-amber-600 text-xs mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Fuera de horario
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Duración <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 ${
                            errors.duration ? 'border-red-500' : 'border-gray-200'
                            }`}
                        >
                            <option value={15}>15 minutos</option>
                            <option value={30}>30 minutos</option>
                            <option value={45}>45 minutos</option>
                            <option value={60}>60 minutos</option>
                        </select>
                        {errors.duration && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.duration}
                            </p>
                        )}
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Tipo de Cita
                        </label>
                        <select
                            name="appointment_type"
                            value={formData.appointment_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800"
                        >
                            <option value="primera_vez">Primera vez</option>
                            <option value="control">Control</option>
                            <option value="emergencia">Emergencia</option>
                            <option value="urgencia">Urgencia</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 group">
                     <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                        Consultorio
                    </label>
                     {availableRooms.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-100">
                            {availableRooms.map(room => {
                                const isSelected = formData.office_number == room.id;
                                return (
                                <button
                                    key={room.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, office_number: room.id }))}
                                    className={`flex items-center px-3 py-2 rounded-lg border transition-all group relative m-1 ${
                                        isSelected
                                        ? 'ring-2 ring-offset-1 ring-blue-500 border-transparent shadow-md' 
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                                    }`}
                                    style={{
                                        backgroundColor: isSelected ? room.color : undefined,
                                    }}
                                >
                                    {!isSelected && (
                                        <div 
                                            className="w-4 h-4 rounded-full mr-3 flex-shrink-0 border border-gray-200 shadow-sm"
                                            style={{ backgroundColor: room.color }}
                                        />
                                    )}
                                    <span className={`font-medium truncate text-sm flex-1 ${isSelected
                                        ? 'text-white text-center' 
                                        : 'text-gray-700 text-left'}`}
                                    >
                                        {room.name}
                                    </span>
                                </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 text-center italic">
                            {formData.specialty_id ? "No hay consultorios disponibles" : "Seleccione una especialidad primero"}
                        </div>
                    )}
                </div>
            </div>

            {/* Sección: Información Clínica */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Información Clínica
                </h3>

                <div className="space-y-6">
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Motivo de Consulta
                        </label>
                         <textarea
                            name="chief_complaint"
                            value={formData.chief_complaint}
                            onChange={handleInputChange}
                            rows={2}
                            placeholder="Ej: Dolor de cabeza, Control de rutina..."
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                Síntomas (Opcional)
                            </label>
                            <textarea
                                name="symptoms"
                                value={formData.symptoms}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Describa los síntomas..."
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400 resize-none"
                            />
                        </div>

                         <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                Notas del Recepcionista
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Notas adicionales..."
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
             <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100 mt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                    {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Agendando...
                    </>
                    ) : (
                    <>
                         <Calendar className="w-4 h-4" />
                         Agendar Cita
                    </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
