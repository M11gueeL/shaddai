import React, { useState } from 'react'; // 👈 CORREGIR: React, useState (no { React, useState })
import { 
  X, 
  User, 
  Stethoscope, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  Activity,
  Edit3 // 👈 AGREGAR Edit3 a las importaciones
} from 'lucide-react';
import EditAppointmentModal from './EditAppointmentModal';

const AppointmentDetailModal = ({ appointment, onClose, onDeleted }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  
  if (!appointment) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'programada': { class: 'bg-blue-100 text-blue-800', label: 'Programada' },
      'confirmada': { class: 'bg-green-100 text-green-800', label: 'Confirmada' },
      'en_progreso': { class: 'bg-yellow-100 text-yellow-800', label: 'En Progreso' },
      'completada': { class: 'bg-gray-100 text-gray-800', label: 'Completada' },
      'cancelada': { class: 'bg-red-100 text-red-800', label: 'Cancelada' },
      'no_se_presento': { class: 'bg-orange-100 text-orange-800', label: 'No se Presentó' }
    };

    const config = statusConfig[status] || statusConfig['programada'];

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-60 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 transition-opacity" onClick={onClose}></div>
          
          <div className="relative border-2 border-gray-300 bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalles de la Cita</h2>
                <p className="text-gray-600 mt-1">ID: #{appointment.id}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Estado y fecha */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusBadge(appointment.status)}
                  <span className="text-sm text-gray-500">
                    Creada el {new Date(appointment.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(appointment.appointment_date)}
                  </div>
                  <div className="text-blue-600 font-medium">
                    {formatTime(appointment.appointment_time)} - {appointment.duration} min
                  </div>
                </div>
              </div>

              {/* Grid de información */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Información del Paciente */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Información del Paciente</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Nombre Completo</label>
                      <p className="text-gray-900">{appointment.patient_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Cédula</label>
                      <p className="text-gray-900">{appointment.patient_cedula || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {appointment.patient_phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {appointment.patient_email || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del Médico */}
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Stethoscope className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Médico Tratante</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Nombre</label>
                      <p className="text-gray-900">Dr. {appointment.doctor_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Especialidad</label>
                      <p className="text-green-600 font-medium">{appointment.specialty_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Consultorio</label>
                      <p className="text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Consultorio {appointment.office_number}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Detalles de la Cita */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Detalles de la Cita</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Tipo de Cita</label>
                    <p className="text-gray-900 capitalize">{appointment.appointment_type?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Duración</label>
                    <p className="text-gray-900">{appointment.duration} minutos</p>
                  </div>
                </div>

                {appointment.chief_complaint && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Motivo de Consulta</label>
                    <p className="text-gray-900 bg-white p-3 rounded-lg border">
                      {appointment.chief_complaint}
                    </p>
                  </div>
                )}

                {appointment.symptoms && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Síntomas</label>
                    <p className="text-gray-900 bg-white p-3 rounded-lg border">
                      {appointment.symptoms}
                    </p>
                  </div>
                )}

                {appointment.notes && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Notas del Recepcionista</label>
                    <p className="text-gray-900 bg-white p-3 rounded-lg border">
                      {appointment.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Historial de Estados */}
              {appointment.status_history && (
                <div className="bg-yellow-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Activity className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Historial de Estados</h3>
                  </div>
                  <p className="text-gray-600">Estado actual: {getStatusBadge(appointment.status)}</p>
                </div>
              )}
            </div>

            {/* Footer con acciones */}
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Editar Cita
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 👈 MODAL DE EDICIÓN FUERA DEL MODAL PRINCIPAL */}
      {showEditModal && (
        <EditAppointmentModal
          appointment={appointment}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedAppointment) => {
            setShowEditModal(false);
            onClose(); // Cerrar también el modal de detalles
            window.location.reload(); // Por ahora, recargar la página
          }}
          onDeleted={(id) => {
            // Cerrar ambos modales y notificar al padre
            setShowEditModal(false);
            onClose();
            onDeleted?.(id);
          }}
        />
      )}
    </>
  );
};

export default AppointmentDetailModal;
