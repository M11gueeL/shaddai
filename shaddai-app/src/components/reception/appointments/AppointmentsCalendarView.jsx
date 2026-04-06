import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Eye, EyeOff } from 'lucide-react';
import { getLocalDateString } from '../../../utils/dateUtils';

const AppointmentsCalendarView = ({ appointments, onViewAppointment, getStatusBadge }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDayPanel, setShowDayPanel] = useState(false);

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
    
    const dateString = getLocalDateString(date);
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

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);
  const monthAppointmentCount = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    return appointments.filter((apt) => {
      if (!apt?.appointment_date) return false;
      const [yy, mm] = apt.appointment_date.split('-').map(Number);
      return yy === y && (mm - 1) === m;
    }).length;
  }, [appointments, currentDate]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-slate-50/40">
      {/* Header del calendario */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-5 border-b border-slate-200 bg-white/90">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-slate-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
          >
            Hoy
          </button>
          <span className="hidden md:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
            {monthAppointmentCount} citas este mes
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowDayPanel((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
              showDayPanel
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:border-blue-300 hover:text-blue-700'
            }`}
            title={showDayPanel ? 'Ocultar panel del día' : 'Mostrar panel del día'}
          >
            {showDayPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDayPanel ? 'Ocultar detalle' : 'Ver detalle'}
          </button>

          <button
            onClick={goToPreviousMonth}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid del calendario */}
      <div className="flex-1 p-4 md:p-5 overflow-auto">
        <div className="grid grid-cols-7 gap-2 rounded-xl">
          
          {/* Headers de días */}
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="bg-slate-100 p-2 text-center text-xs md:text-sm font-semibold text-slate-700 rounded-lg"
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
                onClick={() => day && setSelectedDate(day)}
                className={`min-h-[130px] md:min-h-[150px] p-2.5 relative rounded-xl border transition-all duration-200 ${
                  !day ? 'bg-gray-50' : ''
                } ${isToday(day) ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'} ${
                  day && selectedDate && day.toDateString() === selectedDate.toDateString()
                    ? 'ring-2 ring-blue-500/20 border-blue-300'
                    : ''
                }`}
              >
                {day && (
                  <>
                    {/* Número del día */}
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday(day) 
                        ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center'
                        : isCurrentMonth(day)
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}>
                      {day.getDate()}
                    </div>

                    {/* Citas del día */}
                    <div className="space-y-1.5">
                      {dayAppointments.slice(0, 3).map((appointment) => {
                        const palette = getAppointmentPalette(appointment.status);
                        return (
                        <div
                          key={appointment.id}
                          onClick={() => onViewAppointment(appointment)}
                          className="text-xs p-1.5 rounded-lg cursor-pointer hover:opacity-95 hover:shadow transition-all truncate border-l-4 shadow-sm"
                          style={{
                            backgroundColor: palette.bg,
                            borderLeftColor: palette.color,
                            color: palette.text
                          }}
                          title={`${appointment.appointment_time} - ${appointment.patient_name} - ${appointment.consulting_room_name || 'Sin consultorio'}`}
                        >
                          <div className="flex flex-col space-y-0.5">
                            <div className="flex items-center space-x-1 font-semibold">
                                <Clock className="w-3 h-3 flex-shrink-0 opacity-70" />
                                <span className="truncate">
                                {appointment.appointment_time?.substring(0, 5)} {appointment.patient_name}
                                </span>
                            </div>
                            {appointment.consulting_room_name && (
                                <span 
                                    className="inline-block px-1 rounded text-[10px] font-semibold truncate w-full border"
                                    style={{ 
                                        color: palette.color,
                                        backgroundColor: '#ffffffaa',
                                        borderColor: `${palette.color}55`
                                    }}
                                >
                                    {appointment.consulting_room_name}
                                </span>
                            )}
                          </div>
                        </div>
                        );
                      })}

                      {/* Indicador de densidad alta de citas */}
                      {dayAppointments.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {dayAppointments.slice(0, 8).map((apt) => {
                            const palette = getAppointmentPalette(apt.status);
                            return (
                              <span
                                key={`dot-${apt.id}`}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: palette.color }}
                              />
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Indicador de más citas */}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-blue-700 text-center py-1 font-semibold">
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
        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          <LegendItem color="#3B82F6" label="Programada" />
          <LegendItem color="#10B981" label="Confirmada" />
          <LegendItem color="#F59E0B" label="En Progreso" />
          <LegendItem color="#6B7280" label="Completada" />
          <LegendItem color="#EF4444" label="Cancelada" />
          <LegendItem color="#F97316" label="No se Presentó" />
        </div>
      </div>

      {/* Resumen del día seleccionado */}
      {showDayPanel && (
        <DayDetailPanel 
          selectedDate={selectedDate} 
          appointments={selectedDateAppointments}
          onViewAppointment={onViewAppointment}
          getStatusBadge={getStatusBadge}
        />
      )}
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

const getAppointmentPalette = (status) => {
  const palettes = {
    programada: { color: '#3B82F6', bg: '#DBEAFE', text: '#1E3A8A' },
    confirmada: { color: '#10B981', bg: '#D1FAE5', text: '#065F46' },
    en_progreso: { color: '#F59E0B', bg: '#FEF3C7', text: '#92400E' },
    completada: { color: '#6B7280', bg: '#E5E7EB', text: '#374151' },
    cancelada: { color: '#EF4444', bg: '#FEE2E2', text: '#991B1B' },
    no_se_presento: { color: '#F97316', bg: '#FFEDD5', text: '#9A3412' }
  };

  return palettes[status] || palettes.programada;
};

// Panel lateral con detalles del día
const DayDetailPanel = ({ selectedDate, appointments, onViewAppointment, getStatusBadge }) => {
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'día seleccionado';

  if (appointments.length === 0) {
    return (
      <div className="border-t border-slate-200 p-5 bg-white">
        <div className="max-w-5xl mx-auto text-sm text-slate-500">
          No hay citas para {formattedDate}.
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 p-5 bg-white">
      <div className="max-w-5xl mx-auto">
        <h4 className="text-lg font-semibold text-slate-900 mb-4 capitalize">
          {formattedDate} · {appointments.length} cita(s)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              onClick={() => onViewAppointment(appointment)}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
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
                
                {appointment.consulting_room_name && (
                    <div className="mt-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border"
                        style={{
                            backgroundColor: `${appointment.consulting_room_color}20`,
                            color: appointment.consulting_room_color,
                            borderColor: `${appointment.consulting_room_color}40`
                        }}>
                             {appointment.consulting_room_name}
                        </span>
                    </div>
                )}
                
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
