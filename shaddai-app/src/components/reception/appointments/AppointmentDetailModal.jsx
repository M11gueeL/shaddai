import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../../context/AuthContext';
import appointmentsApi from '../../../api/appointments';
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
  Edit3,
  CheckCircle,
  XCircle,
  Eye,
  History
} from 'lucide-react';
import EditAppointmentModal from './EditAppointmentModal';
import { formatDateLocal } from '../../../utils/dateUtils';

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

const AppointmentDetailModal = ({ appointment, onClose, onDeleted }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { token } = useAuth();
  
  // Estado local para manejar las actualizaciones sin recargar
  const [currentAppointment, setCurrentAppointment] = useState(appointment);

  useEffect(() => {
    setCurrentAppointment(appointment);
  }, [appointment]);

  useEffect(() => {
    if (activeTab === 'history' && currentAppointment?.id) {
       fetchHistory();
    }
  }, [activeTab, currentAppointment]);

  const fetchHistory = async () => {
    try {
        setLoadingHistory(true);
        const res = await appointmentsApi.getHistory(currentAppointment.id);
        setHistory(res.data);
    } catch (error) {
        console.error("Error fetching history:", error);
    } finally {
        setLoadingHistory(false);
    }
  };

  const fetchDetails = async () => {
      try {
          const res = await appointmentsApi.getById(currentAppointment.id);
          if (res.data) {
              setCurrentAppointment(res.data);
          }
      } catch (error) {
          console.error("Error fetching details:", error);
      }
  };
  
  if (!currentAppointment) return null;

  const formatDate = (dateString) => {
    return formatDateLocal(dateString);
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'programada': { class: 'bg-blue-50 text-blue-700 border-blue-200', icon: Calendar, label: 'Programada' },
      'confirmada': { class: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Confirmada' },
      'en_progreso': { class: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, label: 'En Progreso' },
      'completada': { class: 'bg-gray-50 text-gray-700 border-gray-200', icon: CheckCircle, label: 'Completada' },
      'cancelada': { class: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Cancelada' },
      'no_se_presento': { class: 'bg-orange-50 text-orange-700 border-orange-200', icon: XCircle, label: 'No se Presentó' }
    };

    const config = statusConfig[status] || statusConfig['programada'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.class}`}>
        <Icon className="w-3.5 h-3.5 mr-1.5" />
        {config.label}
      </span>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/50 transition-opacity" onClick={onClose}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
               <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Detalles de la Cita</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                            <span>#{currentAppointment.id}</span>
                            <span>•</span>
                            <span>Creada el {new Date(currentAppointment.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                    </div>
               </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 space-y-6">
              
              {/* Tabs Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Detalles
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Historial de Cambios
                </button>
              </div>

              {activeTab === 'details' ? (
                <>
                {/* Top Summary Card */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        {getStatusBadge(currentAppointment.status)}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {formatDate(currentAppointment.appointment_date)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                            <Clock className="w-4 h-4 text-orange-500" />
                            {formatTime(currentAppointment.appointment_time)} - {currentAppointment.duration} min
                        </div>
                    </div>
                </div>

                {/* Patient & Doctor Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Información del Paciente */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" /> 
                            Paciente
                        </h3>
                    </div>
                    <div className="p-5 space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nombre Completo</p>
                                <p className="text-gray-900 font-medium">{currentAppointment.patient_name || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cédula</p>
                                    <p className="text-gray-700">{currentAppointment.patient_cedula || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Teléfono</p>
                                    <p className="text-gray-700 flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                        {currentAppointment.patient_phone || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                                <p className="text-gray-700 flex items-center gap-1.5 truncate">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                    {currentAppointment.patient_email || 'N/A'}
                                </p>
                            </div>
                    </div>
                    </div>

                    {/* Información del Médico */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-gray-500" /> 
                            Médico Tratante
                        </h3>
                    </div>
                    <div className="p-5 space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nombre</p>
                                <p className="text-gray-900 font-medium">Dr. {currentAppointment.doctor_name || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Especialidad</p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        {currentAppointment.specialty_name || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Consultorio</p>
                                    {currentAppointment.consulting_room_name ? (
                                        <div className="flex items-center gap-1.5">
                                            <span 
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border" 
                                                style={{ 
                                                    backgroundColor: `${currentAppointment.consulting_room_color}20`, 
                                                    color: currentAppointment.consulting_room_color, 
                                                    borderColor: `${currentAppointment.consulting_room_color}40`
                                                }}
                                            >
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {currentAppointment.consulting_room_name}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-gray-700 flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            {currentAppointment.office_number ? `Consultorio ${currentAppointment.office_number}` : 'N/A'}
                                        </p>
                                    )}
                                </div>
                            </div>
                    </div>
                    </div>
                </div>

                {/* Detalles de la Cita */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" /> 
                            Detalles Clínicos
                        </h3>
                    </div>
                    <div className="p-5 space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipo de Cita</p>
                                    <p className="text-gray-900 capitalize font-medium">
                                        {currentAppointment.appointment_type?.replace('_', ' ') || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {currentAppointment.chief_complaint && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Motivo de Consulta</p>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 leading-relaxed">
                                        {currentAppointment.chief_complaint}
                                    </div>
                                </div>
                            )}

                            {currentAppointment.symptoms && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Síntomas Reportados</p>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 leading-relaxed">
                                        {currentAppointment.symptoms}
                                    </div>
                                </div>
                            )}

                            {currentAppointment.notes && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notas Administrativas</p>
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-gray-700 leading-relaxed">
                                        {currentAppointment.notes}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                       <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                           <History className="w-4 h-4 text-gray-500" /> 
                           Historial de Cambios
                       </h3>
                    </div>
                    <div className="p-0">
                        {loadingHistory ? (
                            <div className="p-8 text-center text-gray-500">Cargando historial...</div>
                        ) : history.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No hay cambios registrados para esta cita.</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {history.map((log, index) => (
                                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Cambio de estado: <span className="text-gray-500 line-through">{formatStatus(log.previous_status) || 'N/A'}</span> <span className="text-gray-400 mx-1">→</span> <span className="text-blue-600 font-semibold">{formatStatus(log.new_status)}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Modificado por: <span className="font-medium text-gray-700">{log.changed_by_name || 'Desconocido'}</span>
                                                        </p>
                                                        {log.change_reason && (
                                                            <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-gray-600 border border-gray-100">
                                                                Motivo: {log.change_reason}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                                        {new Date(log.changed_at).toLocaleString('es-ES')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center gap-3 p-6 border-t border-gray-100 bg-white shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium"
              >
                Cerrar
              </button>
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all text-sm font-bold flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Editar Cita
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN FUERA DEL MODAL PRINCIPAL */}
      {showEditModal && (
        <EditAppointmentModal
          appointment={currentAppointment}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedAppointment) => {
            setShowEditModal(false);
            fetchDetails();
            fetchHistory();
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
