import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react';

const AppointmentsCalendarView = ({ appointments, onViewAppointment, getStatusBadge }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtener días del mes actual
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay(); // 0 = domingo

    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Filtrar citas por fecha
  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.appointment_date === dateString);
  };

  // Navegación del calendario
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const today = new Date();
  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    if (!date) return false;
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header del calendario */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Hoy
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid del calendario */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden shadow-sm">
          
          {/* Headers de días */}
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700"
            >
              {dayName}
            </div>
          ))}

          {/* Días del calendario */}
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day);
            
            return (
              <div
                key={index}
                className={`bg-white min-h-[120px] p-2 relative ${
                  !day ? 'bg-gray-50' : ''
                } ${isToday(day) ? 'bg-blue-50' : ''}`}
              >
                {day && (
                  <>
                    {/* Número del día */}
                    <div className={`text-sm font-medium mb-1 ${
                      isToday(day) 
                        ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                        : isCurrentMonth(day)
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}>
                      {day.getDate()}
                    </div>

                    {/* Citas del día */}
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          onClick={() => onViewAppointment(appointment)}
                          className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate"
                          style={{
                            backgroundColor: getAppointmentColor(appointment.status),
                            color: 'white'
                          }}
                          title={`${appointment.appointment_time} - ${appointment.patient_name}`}
                        >
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {appointment.appointment_time?.substring(0, 5)} {appointment.patient_name}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Indicador de más citas */}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{dayAppointments.length - 3} más
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Leyenda de colores */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <LegendItem color="#3B82F6" label="Programada" />
          <LegendItem color="#10B981" label="Confirmada" />
          <LegendItem color="#F59E0B" label="En Progreso" />
          <LegendItem color="#6B7280" label="Completada" />
          <LegendItem color="#EF4444" label="Cancelada" />
          <LegendItem color="#F97316" label="No se Presentó" />
        </div>
      </div>

      {/* Resumen del día seleccionado */}
      <DayDetailPanel 
        selectedDate={today} 
        appointments={getAppointmentsForDate(today)}
        onViewAppointment={onViewAppointment}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
};

// Componente auxiliar para la leyenda
const LegendItem = ({ color, label }) => (
  <div className="flex items-center space-x-2">
    <div 
      className="w-3 h-3 rounded"
      style={{ backgroundColor: color }}
    ></div>
    <span className="text-sm text-gray-600">{label}</span>
  </div>
);

// Función para obtener color según el estado
const getAppointmentColor = (status) => {
  const colors = {
    'programada': '#3B82F6',    // Azul
    'confirmada': '#10B981',    // Verde
    'en_progreso': '#F59E0B',   // Amarillo
    'completada': '#6B7280',    // Gris
    'cancelada': '#EF4444',     // Rojo
    'no_se_presento': '#F97316' // Naranja
  };
  return colors[status] || colors['programada'];
};

// Panel lateral con detalles del día
const DayDetailPanel = ({ selectedDate, appointments, onViewAppointment, getStatusBadge }) => {
  if (appointments.length === 0) return null;

  return (
    <div className="border-t border-gray-200 p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Citas de Hoy ({appointments.length})
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              onClick={() => onViewAppointment(appointment)}
              className="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {appointment.appointment_time?.substring(0, 5)}
                </div>
                {getStatusBadge(appointment.status)}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {appointment.patient_name}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  Dr. {appointment.doctor_name}
                </div>
                
                {appointment.chief_complaint && (
                  <div className="text-xs text-gray-500 italic truncate">
                    "{appointment.chief_complaint}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsCalendarView;
