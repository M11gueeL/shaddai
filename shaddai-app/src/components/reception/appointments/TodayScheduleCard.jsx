import { Calendar, Clock, User, Stethoscope, ChevronRight, CalendarDays } from 'lucide-react';

export default function TodayScheduleCard({ items = [], loading, error, onItemClick, onViewAll }) {
  const list = Array.isArray(items) ? items : [];

  const getStatusStyles = (status) => {
    switch (status) {
      case 'confirmada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'programada': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'en_progreso': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completada': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelada': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-indigo-500" />
          Agenda de Hoy
        </h3>
        <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {loading && list.length === 0 && (
          <div className="space-y-3">
             {[1,2,3].map(i => (
                <div key={i} className="flex items-center p-4 bg-gray-50 rounded-xl animate-pulse">
                    <div className="w-16 h-8 bg-gray-200 rounded mr-4"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
             ))}
          </div>
        )}
        
        {!loading && error && (
          <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-center">{error}</div>
        )}
        
        {!loading && !error && list.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Calendar className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm font-medium">No hay citas programadas para hoy</p>
          </div>
        )}

        {list.map((appointment, index) => {
          const time = appointment.appointment_time || appointment.time || '';
          const patientName = appointment.patient_name || appointment.patient || 'Paciente';
          const doctorName = appointment.doctor_name || appointment.doctor || '';
          const type = appointment.appointment_type || appointment.type || '';
          const status = appointment.status || 'programada';
          
          return (
            <button
              key={appointment.id || appointment.appointment_id || index}
              onClick={() => onItemClick && onItemClick(appointment)}
              className="group w-full text-left flex items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-md hover:bg-indigo-50/30 transition-all duration-300"
            >
              <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center border-r border-gray-100 pr-4 mr-4 group-hover:border-indigo-200 transition-colors">
                <Clock className="w-4 h-4 text-indigo-400 mb-1" />
                <span className="text-lg font-bold text-gray-900">{time?.slice(0,5)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900 truncate pr-2 group-hover:text-indigo-700 transition-colors">{patientName}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyles(status)} capitalize`}>
                    {status}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        <span className="truncate">Dr. {doctorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="capitalize">{String(type).replace('_',' ')}</span>
                    </div>
                </div>
              </div>

              <div className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <ChevronRight className="w-5 h-5 text-indigo-400" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button 
          onClick={() => onViewAll && onViewAll()}
          className="w-full py-2.5 text-center text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          Ver agenda completa 
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
