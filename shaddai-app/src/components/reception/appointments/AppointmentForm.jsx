// src/components/reception/appointments/AppointmentForm.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, FileText, AlertCircle, X } from 'lucide-react';
import PatientSearch from './PatientSearch';
import DoctorSelector from './DoctorSelector';
import SpecialtySelector from './SpecialtySelector';
import appointmentsAPI from '../../../api/appointments';

const AppointmentForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    office_number: 1,
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
  const [isLoading, setIsLoading] = useState(false);

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

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    setIsLoading(true);
    try {
        const token = getToken();
        
        // 👈 ASEGURAR QUE STATUS ESTÉ EN LOS DATOS
        const dataToSend = {
        ...formData,
        status: formData.status || 'programada' // 👈 FALLBACK
        };
        
        console.log('Data being sent:', dataToSend); // 👈 DEBUG
        
        const response = await appointmentsAPI.create(dataToSend, token);
        
        alert('Cita agendada exitosamente');
        onClose(); // Cerrar modal
        
    } catch (error) {
        console.error('Error creating appointment:', error);
        // 👈 MOSTRAR MÁS DETALLES DEL ERROR
        const errorMessage = error.response?.data?.error || error.message || 'Error al crear la cita';
        console.log('Full error response:', error.response?.data);
        alert(errorMessage);
    } finally {
        setIsLoading(false);
    }
    };

  return (
    <div className="p-6">
      {/* Header del modal */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Agendar Nueva Cita
          </h2>
          <p className="text-gray-600">
            Complete los datos para programar una cita médica
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* 👈 FORM QUE INCLUYE TODO, INCLUYENDO LOS BOTONES */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contenido scrolleable */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
          
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
                }`}
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
                }`}
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
                }`}
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

          {/* Configuración adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Consultorio
              </label>
              <select
                name="office_number"
                value={formData.office_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="primera_vez">Primera vez</option>
                <option value="control">Control</option>
                <option value="emergencia">Emergencia</option>
                <option value="urgencia">Urgencia</option>
              </select>
            </div>
          </div>

          {/* Motivo de consulta */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Síntomas */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Síntomas (Opcional)
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describa los síntomas que presenta el paciente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Notas del recepcionista */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notas del Recepcionista (Opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Notas adicionales sobre la cita..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 👈 BOTONES DENTRO DEL FORM */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Agendando...
              </>
            ) : (
              'Agendar Cita'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
