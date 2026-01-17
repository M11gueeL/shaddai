import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  FileText, 
  AlertCircle,
  Edit3,
  CheckCircle,
  XCircle,
  Trash2,
  Activity
} from 'lucide-react';
import PatientSearch from './PatientSearch';
import DoctorSelector from './DoctorSelector';
import SpecialtySelector from './SpecialtySelector';
import TimePicker from './TimePicker';
import appointmentsAPI from '../../../api/appointments';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';

const formatStatus = (status) => {
  const statusMap = {
    'programada': 'Programada',
    'confirmada': 'Confirmada',
    'en_progreso': 'En Progreso',
    'completada': 'Completada',
    'cancelada': 'Cancelada',
    'no_se_presento': 'No se Presentó'
  };
  return statusMap[status] || status;
};

const EditAppointmentModal = ({ appointment, onClose, onUpdate, onDeleted }) => {
  const toast = useToast();
  const { confirm } = useConfirm();
  const { token } = useAuth(); // Get Token
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    office_number: 1,
    specialty_id: '',
    duration: 30,
    status: 'programada',
    appointment_type: 'primera_vez',
    chief_complaint: '',
    symptoms: '',
    notes: ''
  });

  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'medical', 'status'
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Cargar historial si la tab es status
  useEffect(() => {
    if (activeTab === 'status' && appointment?.id) {
       fetchHistory();
    }
  }, [activeTab, appointment]);

  const fetchHistory = async () => {
    try {
        setLoadingHistory(true);
        const res = await appointmentsAPI.getHistory(appointment.id, token);
        setHistory(res.data);
    } catch (error) {
        console.error("Error fetching history:", error);
    } finally {
        setLoadingHistory(false);
    }
  };

  // Cargar datos de la cita al abrir el modal
  useEffect(() => {
    if (appointment) {
      loadAppointmentData();
    }
  }, [appointment]);

  // Detectar cambios en el formulario
  useEffect(() => {
    const hasFormChanges = Object.keys(formData).some(key => 
      formData[key] !== originalData[key]
    );
    setHasChanges(hasFormChanges);
  }, [formData, originalData]);

  const loadAppointmentData = () => {
    const data = {
      patient_id: appointment.patient_id || '',
      doctor_id: appointment.doctor_id || '',
      appointment_date: appointment.appointment_date || '',
      appointment_time: appointment.appointment_time || '',
      office_number: appointment.office_number || 1,
      specialty_id: appointment.specialty_id || '',
      duration: appointment.duration || 30,
      status: appointment.status || 'programada',
      appointment_type: appointment.appointment_type || 'primera_vez',
      chief_complaint: appointment.chief_complaint || '',
      symptoms: appointment.symptoms || '',
      notes: appointment.notes || ''
    };

    setFormData(data);
    setOriginalData(data);

    // Cargar datos relacionados
    if (appointment.patient_name) {
      setSelectedPatient({
        id: appointment.patient_id,
        full_name: appointment.patient_name,
        cedula: appointment.patient_cedula
      });
    }

    if (appointment.doctor_name) {
      setSelectedDoctor({
        id: appointment.doctor_id,
        first_name: appointment.doctor_name?.split(' ')[0] || '',
        last_name: appointment.doctor_name?.split(' ').slice(1).join(' ') || '',
        specialties: appointment.specialty_name ? [{ 
          id: appointment.specialty_id, 
          name: appointment.specialty_name 
        }] : []
      });
      
      if (appointment.specialty_name) {
        setAvailableSpecialties([{
          id: appointment.specialty_id,
          name: appointment.specialty_name
        }]);
      }
    }
  };

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
    
    // Validar fecha no sea pasada (solo si se cambió)
    if (formData.appointment_date && formData.appointment_date < getMinDate() && formData.appointment_date !== originalData.appointment_date) {
      newErrors.appointment_date = 'No se pueden programar citas en fechas pasadas';
    }

    // Validar hora si es hoy y se cambió
    if (formData.appointment_date === getMinDate() && formData.appointment_time < getMinTime() && 
        (formData.appointment_date !== originalData.appointment_date || formData.appointment_time !== originalData.appointment_time)) {
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

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await appointmentsAPI.update(appointment.id, formData, token);
      toast.success('Cita actualizada exitosamente');
      onUpdate?.(response.data); // Callback para actualizar la lista
      onClose();
      
    } catch (error) {
      console.error('Error updating appointment:', error);
      const errorMessage = error.response?.data?.error || 'Error al actualizar la cita';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Cambio rápido de status
  const handleQuickStatusChange = async (newStatus) => {
    if (newStatus === formData.status) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await appointmentsAPI.updateStatus(appointment.id, { 
        status: newStatus,
        notes: `Estado cambiado a ${newStatus} desde el panel de recepción`
      }, token);
      
      setFormData(prev => ({ ...prev, status: newStatus }));
      toast.success(`Estado cambiado a ${newStatus} exitosamente`);
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al cambiar el estado');
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar cita
  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Eliminar cita',
      message: '¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      tone: 'danger',
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await appointmentsAPI.delete(appointment.id, token);
      toast.success('Cita eliminada exitosamente');
      onDeleted?.(appointment.id);
      onClose();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      const msg = error.response?.data?.error || 'Error al eliminar la cita';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const getChangedFields = () => {
    const changes = [];
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalData[key]) {
        changes.push(key);
      }
    });
    return changes;
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <Edit3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Editar Cita #{appointment?.id}</h2>
                    <p className="text-gray-500 text-sm">Modifique los detalles de la cita</p>
                </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 p-2 bg-gray-50 border-b border-gray-100 shrink-0 overflow-x-auto">
              {[
                { id: 'basic', label: 'Datos Básicos', icon: Calendar },
                { id: 'medical', label: 'Información Médica', icon: FileText },
                { id: 'status', label: 'Estado y Auditoría', icon: Activity }
              ].map(tab => {
                 const Icon = tab.icon;
                 return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                        <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                 );
              })}
           </div>

           {/* Form Content */}
           <div className="flex-1 overflow-y-auto bg-gray-50/50">
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                
                {activeTab === 'basic' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                Especialidad <span className="text-red-500">*</span>
                            </label>
                            <SpecialtySelector
                                specialties={availableSpecialties}
                                value={formData.specialty_id}
                                onChange={(value) => {
                                    setFormData(prev => ({ ...prev, specialty_id: value }));
                                }}
                                error={errors.specialty_id}
                                disabled={!formData.doctor_id}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 ${
                                            formData.appointment_date !== originalData.appointment_date 
                                            ? 'bg-yellow-50 border-yellow-300' 
                                            : 'bg-gray-50 border-gray-200'
                                        } ${errors.appointment_date ? 'border-red-500' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                    Hora <span className="text-red-500">*</span>
                                </label>
                                <TimePicker
                                    value={formData.appointment_time}
                                    onChange={(t) => handleInputChange({ target: { name: 'appointment_time', value: t } })}
                                    className={`pl-10 pr-4 py-2.5 flex items-center justify-between rounded-lg border transition-all text-sm text-gray-800 ${
                                         formData.appointment_time !== originalData.appointment_time
                                         ? 'bg-yellow-50 border-yellow-300'
                                         : 'bg-gray-50 border-gray-200'
                                    } ${errors.appointment_time ? 'border-red-500' : ''}`}
                                    error={errors.appointment_time}
                                />
                            </div>

                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                    Duración <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 ${
                                        formData.duration !== originalData.duration
                                        ? 'bg-yellow-50 border-yellow-300'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <option value={15}>15 minutos</option>
                                    <option value={30}>30 minutos</option>
                                    <option value={45}>45 minutos</option>
                                    <option value={60}>60 minutos</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                    Consultorio
                                </label>
                                <select
                                    name="office_number"
                                    value={formData.office_number}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 ${
                                        formData.office_number !== originalData.office_number
                                        ? 'bg-yellow-50 border-yellow-300'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <option value={1}>Consultorio 1</option>
                                    <option value={2}>Consultorio 2</option>
                                    <option value={3}>Consultorio 3</option>
                                </select>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                    Tipo de Cita
                                </label>
                                <select
                                    name="appointment_type"
                                    value={formData.appointment_type}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 ${
                                        formData.appointment_type !== originalData.appointment_type
                                        ? 'bg-yellow-50 border-yellow-300'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <option value="primera_vez">Primera vez</option>
                                    <option value="control">Control</option>
                                    <option value="emergencia">Emergencia</option>
                                    <option value="urgencia">Urgencia</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'medical' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                         <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                Motivo de Consulta
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FileText className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="chief_complaint"
                                    value={formData.chief_complaint}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Dolor de cabeza..."
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 ${
                                        formData.chief_complaint !== originalData.chief_complaint 
                                        ? 'bg-yellow-50 border-yellow-300' 
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                Síntomas
                            </label>
                            <textarea
                                name="symptoms"
                                value={formData.symptoms}
                                onChange={handleInputChange}
                                rows={4}
                                className={`w-full px-4 py-2.5 rounded-lg border focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 resize-none ${
                                    formData.symptoms !== originalData.symptoms 
                                    ? 'bg-yellow-50 border-yellow-300' 
                                    : 'bg-gray-50 border-gray-200'
                                }`}
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
                                rows={4}
                                className={`w-full px-4 py-2.5 rounded-lg border focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 resize-none ${
                                    formData.notes !== originalData.notes 
                                    ? 'bg-yellow-50 border-yellow-300' 
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'status' && (
                     <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                Estado de la Cita
                            </h3>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { value: 'programada', label: 'Programada', icon: Calendar, color: 'blue' },
                                    { value: 'confirmada', label: 'Confirmada', icon: CheckCircle, color: 'green' },
                                    { value: 'en_progreso', label: 'En Progreso', icon: Clock, color: 'yellow' },
                                    { value: 'completada', label: 'Completada', icon: CheckCircle, color: 'gray' },
                                    { value: 'cancelada', label: 'Cancelada', icon: XCircle, color: 'red' },
                                    { value: 'no_se_presento', label: 'No se Presentó', icon: XCircle, color: 'orange' }
                                ].map((statusOption) => {
                                    const Icon = statusOption.icon;
                                    const isSelected = formData.status === statusOption.value;
                                    return (
                                    <label
                                        key={statusOption.value}
                                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                                        isSelected
                                            ? `border-${statusOption.color}-500 bg-${statusOption.color}-50 ring-1 ring-${statusOption.color}-500`
                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                        type="radio"
                                        name="status"
                                        value={statusOption.value}
                                        checked={isSelected}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                        />
                                        <Icon className={`w-5 h-5 mr-3 ${
                                        isSelected 
                                            ? `text-${statusOption.color}-600` 
                                            : 'text-gray-400'
                                        }`} />
                                        <span className={`text-sm font-medium ${
                                        isSelected
                                            ? `text-${statusOption.color}-900` 
                                            : 'text-gray-700'
                                        }`}>
                                        {statusOption.label}
                                        </span>
                                    </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Audit Info with Full History */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                Auditoría e Historial
                             </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 mb-6 font-mono bg-gray-50 p-3 rounded">
                                <div>
                                    <span className="font-semibold text-gray-700 block">Creada por ID:</span>
                                    {appointment.created_by || 'N/A'}
                                </div>
                                 <div>
                                    <span className="font-semibold text-gray-700 block">Fecha de creación:</span>
                                    {new Date(appointment.created_at).toLocaleString('es-ES')}
                                </div>
                                 <div>
                                    <span className="font-semibold text-gray-700 block">Última actualización:</span>
                                    {new Date(appointment.updated_at).toLocaleString('es-ES')}
                                </div>
                            </div>

                            <div className="mt-4">
                                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Historial de Cambios</h4>
                                {loadingHistory ? (
                                    <div className="text-center py-4 text-gray-500 text-sm">Cargando historial...</div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-4 text-gray-400 text-sm italic border rounded-lg border-dashed">
                                        No hay cambios registrados
                                    </div>
                                ) : (
                                    <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                                        {history.map((log, index) => (
                                            <div key={index} className="flex gap-3 text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="mt-0.5">
                                                     <Activity className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-medium text-gray-900">
                                                            {formatStatus(log.previous_status) || 'N/A'} → <span className="text-blue-600">{formatStatus(log.new_status)}</span>
                                                        </span>
                                                        <span className="text-xs text-gray-400 ml-2">
                                                            {new Date(log.changed_at).toLocaleString('es-ES')}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Por: <span className="font-medium text-gray-700">{log.changed_by_name || 'Sistema'}</span>
                                                    </div>
                                                    {log.change_reason && (
                                                        <div className="mt-1.5 text-xs text-gray-600 italic bg-white p-1.5 rounded border border-gray-200">
                                                            "{log.change_reason}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>
                )}
                
                {/* Footer Buttons */}
               <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-6">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-100 transition-all text-sm font-medium flex items-center gap-2"
                    >
                        {isDeleting ? 'Eliminando...' : <><Trash2 className="w-4 h-4" /> Eliminar Cita</>}
                    </button>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !hasChanges}
                            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:shadow-none transition-all text-sm font-bold flex items-center gap-2"
                        >
                             {isLoading ? 'Guardando...' : <><Save className="w-4 h-4" /> Guardar Cambios</>}
                        </button>
                    </div>
               </div>
             </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
