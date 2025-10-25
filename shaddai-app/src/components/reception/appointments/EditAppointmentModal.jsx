import React, { useState, useEffect } from 'react';
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
  Trash2
} from 'lucide-react';
import PatientSearch from './PatientSearch';
import DoctorSelector from './DoctorSelector';
import SpecialtySelector from './SpecialtySelector';
import appointmentsAPI from '../../../api/appointments';

const EditAppointmentModal = ({ appointment, onClose, onUpdate, onDeleted }) => {
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
      
      alert('Cita actualizada exitosamente');
      onUpdate?.(response.data); // Callback para actualizar la lista
      onClose();
      
    } catch (error) {
      console.error('Error updating appointment:', error);
      const errorMessage = error.response?.data?.error || 'Error al actualizar la cita';
      alert(errorMessage);
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
      alert(`Estado cambiado a ${newStatus} exitosamente`);
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al cambiar el estado');
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar cita
  const handleDelete = async () => {
    const confirmed = confirm('¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await appointmentsAPI.delete(appointment.id, token);
      alert('Cita eliminada exitosamente');
      onDeleted?.(appointment.id);
      onClose();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      const msg = error.response?.data?.error || 'Error al eliminar la cita';
      alert(msg);
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
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-xs bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative overflow-y-auto bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <Edit3 className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Cita</h2>
                <p className="text-gray-600">{appointment.patient_name}</p>
              </div>
              {hasChanges && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  Cambios sin guardar
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Acciones Rápidas de Estado */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">Cambio Rápido de Estado:</div>
              <div className="flex space-x-2">
                {['confirmada', 'en_progreso', 'completada', 'cancelada'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleQuickStatusChange(status)}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      formData.status === status
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Datos Básicos
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'medical'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Información Médica
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'status'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Estado y Configuración
            </button>
          </div>

          {/* Contenido del formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Tab: Datos Básicos */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  
                  {/* Selección de Paciente y Doctor */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        <User className="inline w-4 h-4 mr-1" />
                        Paciente *
                      </label>
                      <PatientSearch
                        onSelect={handlePatientSelect}
                        error={errors.patient_id}
                        selectedPatient={selectedPatient}
                        initialValue={appointment.patient_name}
                      />
                      {errors.patient_id && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.patient_id}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        <Stethoscope className="inline w-4 h-4 mr-1" />
                        Médico *
                      </label>
                      <DoctorSelector
                        onSelect={handleDoctorSelect}
                        error={errors.doctor_id}
                        selectedDoctor={selectedDoctor}
                      />
                      {errors.doctor_id && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.doctor_id}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Especialidad */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Especialidad Médica *
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
                      <p className="text-red-500 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.specialty_id}
                      </p>
                    )}
                  </div>

                  {/* Fecha, Hora y Duración */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Fecha de Cita *
                      </label>
                      <input
                        type="date"
                        name="appointment_date"
                        value={formData.appointment_date}
                        onChange={handleInputChange}
                        min={getMinDate()}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.appointment_date ? 'border-red-500' : 'border-gray-300'
                        } ${formData.appointment_date !== originalData.appointment_date ? 'bg-yellow-50 border-yellow-300' : ''}`}
                      />
                      {errors.appointment_date && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.appointment_date}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Hora de Cita *
                      </label>
                      <input
                        type="time"
                        name="appointment_time"
                        value={formData.appointment_time}
                        onChange={handleInputChange}
                        min={getMinTime()}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.appointment_time ? 'border-red-500' : 'border-gray-300'
                        } ${formData.appointment_time !== originalData.appointment_time ? 'bg-yellow-50 border-yellow-300' : ''}`}
                      />
                      {errors.appointment_time && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.appointment_time}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Duración (minutos) *
                      </label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.duration ? 'border-red-500' : 'border-gray-300'
                        } ${formData.duration !== originalData.duration ? 'bg-yellow-50 border-yellow-300' : ''}`}
                      >
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>60 minutos</option>
                      </select>
                      {errors.duration && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.duration}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Consultorio y Tipo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Consultorio
                      </label>
                      <select
                        name="office_number"
                        value={formData.office_number}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formData.office_number !== originalData.office_number ? 'bg-yellow-50 border-yellow-300' : 'border-gray-300'
                        }`}
                      >
                        <option value={1}>Consultorio 1</option>
                        <option value={2}>Consultorio 2</option>
                        <option value={3}>Consultorio 3</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Cita
                      </label>
                      <select
                        name="appointment_type"
                        value={formData.appointment_type}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formData.appointment_type !== originalData.appointment_type ? 'bg-yellow-50 border-yellow-300' : 'border-gray-300'
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

              {/* Tab: Información Médica */}
              {activeTab === 'medical' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <FileText className="inline w-4 h-4 mr-1" />
                      Motivo de Consulta
                    </label>
                    <input
                      type="text"
                      name="chief_complaint"
                      value={formData.chief_complaint}
                      onChange={handleInputChange}
                      placeholder="Ej: Dolor de cabeza, Control de rutina..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formData.chief_complaint !== originalData.chief_complaint ? 'bg-yellow-50 border-yellow-300' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Síntomas
                    </label>
                    <textarea
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describa los síntomas que presenta el paciente..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formData.symptoms !== originalData.symptoms ? 'bg-yellow-50 border-yellow-300' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Notas del Recepcionista
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Notas adicionales sobre la cita..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formData.notes !== originalData.notes ? 'bg-yellow-50 border-yellow-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Tab: Estado y Configuración */}
              {activeTab === 'status' && (
                <div className="space-y-6">
                  
                  {/* Estado actual */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de la Cita</h3>
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
                        return (
                          <label
                            key={statusOption.value}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.status === statusOption.value
                                ? `border-${statusOption.color}-500 bg-${statusOption.color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="status"
                              value={statusOption.value}
                              checked={formData.status === statusOption.value}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <Icon className={`w-5 h-5 mr-3 ${
                              formData.status === statusOption.value 
                                ? `text-${statusOption.color}-600` 
                                : 'text-gray-400'
                            }`} />
                            <span className={`text-sm font-medium ${
                              formData.status === statusOption.value 
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

                  {/* Información de auditoría */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Auditoría</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block font-medium text-gray-500">Creada por:</label>
                        <p className="text-gray-900">Usuario ID: {appointment.created_by}</p>
                      </div>
                      <div>
                        <label className="block font-medium text-gray-500">Fecha de creación:</label>
                        <p className="text-gray-900">
                          {new Date(appointment.created_at).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <div>
                        <label className="block font-medium text-gray-500">Última actualización:</label>
                        <p className="text-gray-900">
                          {new Date(appointment.updated_at).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <div>
                        <label className="block font-medium text-gray-500">ID de la cita:</label>
                        <p className="text-gray-900">#{appointment.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mostrar cambios pendientes */}
                  {hasChanges && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <h4 className="font-medium text-orange-900 mb-2">Cambios Pendientes:</h4>
                      <ul className="text-sm text-orange-800">
                        {getChangedFields().map((field) => (
                          <li key={field} className="capitalize">
                            • {field.replace('_', ' ')}: {originalData[field]} → {formData[field]}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer con botones */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !hasChanges}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
