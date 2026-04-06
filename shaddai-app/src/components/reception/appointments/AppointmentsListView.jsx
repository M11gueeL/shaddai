import React from 'react';
import { Calendar, Clock, User, Stethoscope, Eye, MoreHorizontal } from 'lucide-react';
import { formatDateLocal } from '../../../utils/dateUtils';

const AppointmentsListView = ({ appointments, onViewAppointment, getStatusBadge }) => {
  const formatDate = (dateString) => {
    return formatDateLocal(dateString);
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-5 md:p-6 space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas</h3>
            <p className="text-gray-500">No se encontraron citas con los filtros aplicados.</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            (() => {
              const hasCedula = Boolean(
                appointment.patient_cedula && String(appointment.patient_cedula).trim()
              );

              return (
            <div
              key={appointment.id}
              className="bg-white/95 border border-slate-200 rounded-2xl p-5 md:p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer"
              onClick={() => onViewAppointment(appointment)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Paciente */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      Paciente
                    </div>
                    <div className="font-bold text-slate-900">
                      {appointment.patient_name || 'N/A'}
                    </div>
                    {hasCedula ? (
                      <div className="text-sm text-gray-600">
                        C.I: {appointment.patient_cedula}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          C.I: No posee
                        </span>
                        {appointment.representative_name && (
                          <span className="text-xs text-gray-500 truncate" title={`Rep: ${appointment.representative_name}`}>
                            Rep: {appointment.representative_name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Médico y Especialidad */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Stethoscope className="w-4 h-4 mr-1" />
                      Médico
                    </div>
                    <div className="font-bold text-slate-900">
                      Dr. {appointment.doctor_name || 'N/A'}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">
                      {appointment.specialty_name || 'N/A'}
                    </div>
                  </div>

                  {/* Fecha y Hora */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Fecha y Hora
                    </div>
                    <div className="font-bold text-slate-900">
                      {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(appointment.appointment_time)}
                    </div>
                  </div>

                  {/* Estado y Detalles */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Estado</div>
                    <div>{getStatusBadge(appointment.status)}</div>
                    <div className="mt-2">
                    {appointment.consulting_room_name ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border" style={{ backgroundColor: appointment.consulting_room_color + '20', color: appointment.consulting_room_color, borderColor: appointment.consulting_room_color + '40' }}>
                            {appointment.consulting_room_name}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-600">
                            Consultorio {appointment.office_number || 'N/A'}
                        </span>
                    )}
                    </div>
                  </div>

                </div>

                {/* Acciones */}
                <div className="ml-4 flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewAppointment(appointment);
                    }}
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Motivo de consulta */}
              {appointment.chief_complaint && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-sm text-slate-500 mb-1">Motivo de consulta:</div>
                  <div className="text-sm text-slate-700 italic">
                    "{appointment.chief_complaint}"
                  </div>
                </div>
              )}
            </div>
              );
            })()
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentsListView;
