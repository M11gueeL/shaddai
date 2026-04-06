// src/components/reception/appointments/AppointmentForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, FileText, AlertCircle, X, ChevronDown, Loader2 } from 'lucide-react';
import PatientSearch from './PatientSearch';
import DoctorSelector from './DoctorSelector';
import SpecialtySelector from './SpecialtySelector';
import appointmentsAPI from '../../../api/appointments';
import specialtiesAPI from '../../../api/specialties';
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
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [loadingDoctorSchedules, setLoadingDoctorSchedules] = useState(false);
  const [showSchedulesGuide, setShowSchedulesGuide] = useState(true);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOutsidePreferred, setIsOutsidePreferred] = useState(false);
  const { confirm } = useConfirm();

  // Obtener fecha mínima (hoy) en local
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Obtener hora mínima si es hoy
  const getMinTime = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (formData.appointment_date === todayStr) {
      const hours = today.getHours().toString().padStart(2, '0');
      const minutes = today.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '06:00';
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
    setShowSchedulesGuide(true);
    setFormData(prev => ({
      ...prev,
      doctor_id: doctor ? doctor.id : ''
    }));
    if (errors.doctor_id) {
      setErrors(prev => ({ ...prev, doctor_id: '' }));
    }
  };

  const handleSpecialtyChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      specialty_id: value,
      doctor_id: ''
    }));
    setSelectedDoctor(null);
    setDoctorSchedules([]);
    setIsOutsidePreferred(false);
    if (errors.specialty_id || errors.doctor_id) {
      setErrors((prev) => ({
        ...prev,
        specialty_id: '',
        doctor_id: ''
      }));
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

  const dayLabels = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo'
  };

  const formatClock = (value) => {
    if (!value) return '';
    const [hh, mm] = String(value).slice(0, 5).split(':');
    const hours = Number(hh);
    const minutes = Number(mm);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return String(value).slice(0, 5);
    const period = hours >= 12 ? 'PM' : 'AM';
    const twelve = hours % 12 || 12;
    return `${twelve}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const groupedDoctorSchedules = useMemo(() => {
    if (!Array.isArray(doctorSchedules) || !doctorSchedules.length) return [];
    const grouped = new Map();

    doctorSchedules.forEach((item) => {
      const day = Number(item.day_of_week);
      if (!grouped.has(day)) grouped.set(day, []);
      grouped.get(day).push(`${formatClock(item.start_time)} - ${formatClock(item.end_time)}`);
    });

    return [...grouped.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([day, ranges]) => ({
        day,
        label: dayLabels[day] || `Día ${day}`,
        ranges
      }));
  }, [doctorSchedules]);

  const totalScheduleBlocks = useMemo(
    () => groupedDoctorSchedules.reduce((total, item) => total + item.ranges.length, 0),
    [groupedDoctorSchedules]
  );

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const response = await specialtiesAPI.getAll();
        const specialties = Array.isArray(response.data) ? response.data : [];
        setAvailableSpecialties(specialties);
      } catch (error) {
        console.error('Error loading specialties:', error);
        setAvailableSpecialties([]);
      }
    };

    loadSpecialties();
  }, []);

  useEffect(() => {
    const loadDoctorSchedules = async () => {
      if (!formData.doctor_id) {
        setDoctorSchedules([]);
        setLoadingDoctorSchedules(false);
        return;
      }

      setLoadingDoctorSchedules(true);
      try {
        const response = await schedulesAPI.list({ doctorId: formData.doctor_id });
        const schedules = Array.isArray(response.data)
          ? response.data
          : (Array.isArray(response.data?.data) ? response.data.data : []);
        setDoctorSchedules(schedules);
      } catch (error) {
        console.error('Error loading doctor schedules:', error);
        setDoctorSchedules([]);
      } finally {
        setLoadingDoctorSchedules(false);
      }
    };

    loadDoctorSchedules();
  }, [formData.doctor_id]);


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
      if (!formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
        setIsOutsidePreferred(false);
        return false;
      }

      const schedules = Array.isArray(doctorSchedules) ? doctorSchedules : [];
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

    const response = await appointmentsAPI.create(dataToSend);
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
  }, [doctorSchedules, formData.doctor_id, formData.appointment_date, formData.appointment_time, formData.duration]);

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
                        Especialidad <span className="text-red-500">*</span>
                      </label>
                      <SpecialtySelector
                        specialties={availableSpecialties}
                        value={formData.specialty_id}
                        onChange={handleSpecialtyChange}
                        error={errors.specialty_id}
                        disabled={false}
                      />
                      {errors.specialty_id && (
                         <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.specialty_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 mt-6">
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Médico <span className="text-red-500">*</span>
                        </label>
                        <DoctorSelector
                            onSelect={handleDoctorSelect}
                            error={errors.doctor_id}
                            selectedDoctor={selectedDoctor}
                        specialtyId={formData.specialty_id}
                        disabled={!formData.specialty_id}
                        />
                        {errors.doctor_id && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.doctor_id}
                            </p>
                        )}

                      {!!formData.doctor_id && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/70 shadow-sm overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setShowSchedulesGuide((prev) => !prev)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                                <Clock className="w-4 h-4" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-semibold text-slate-800">Guía de horario del médico</p>
                                <p className="text-xs text-slate-500">
                                  {loadingDoctorSchedules
                                    ? 'Consultando disponibilidad habitual...'
                                    : `${groupedDoctorSchedules.length || 0} días configurados · ${totalScheduleBlocks || 0} bloques`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!loadingDoctorSchedules && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                  Referencia
                                </span>
                              )}
                              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showSchedulesGuide ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          {showSchedulesGuide && (
                            <div className="px-4 pb-4 animate-in fade-in-50 duration-200">
                              {loadingDoctorSchedules ? (
                                <div className="space-y-2 mt-1">
                                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                    Cargando horarios...
                                  </div>
                                  <div className="h-8 rounded-lg bg-slate-200/70 animate-pulse" />
                                  <div className="h-8 rounded-lg bg-slate-200/70 animate-pulse" />
                                </div>
                              ) : groupedDoctorSchedules.length > 0 ? (
                                <div className="space-y-2 mt-1">
                                  {groupedDoctorSchedules.map((item) => (
                                    <div key={item.day} className="flex flex-wrap items-center gap-2 bg-white/90 border border-slate-200 rounded-lg px-3 py-2">
                                      <span className="text-xs font-semibold text-slate-700 min-w-20">{item.label}</span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {item.ranges.map((range, idx) => (
                                          <span
                                            key={`${item.day}-${idx}`}
                                            className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 border border-blue-100 text-[12px] font-medium text-blue-700"
                                          >
                                            {range}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="mt-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 mt-0.5" />
                                  Este médico no tiene horarios preferidos configurados.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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
                            key={formData.appointment_date}
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
