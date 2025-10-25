export default function TodayScheduleCard({ items = [], loading, error, onItemClick, onViewAll }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'programada': return 'bg-blue-100 text-blue-800';
      case 'en_progreso': return 'bg-yellow-100 text-yellow-800';
      case 'completada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Agenda de Hoy</h3>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading && (
          <div className="text-sm text-gray-500 p-4">Cargando agenda…</div>
        )}
        {!loading && error && (
          <div className="text-sm text-red-600 p-4">{error}</div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="text-sm text-gray-500 p-4">No hay citas programadas para hoy.</div>
        )}
        {!loading && !error && items.map((appointment, index) => {
          const time = appointment.appointment_time || appointment.time || '';
          const patientName = appointment.patient_name || appointment.patient || 'Paciente';
          const doctorName = appointment.doctor_name || appointment.doctor || '';
          const type = appointment.appointment_type || appointment.type || '';
          const status = appointment.status || 'programada';
          return (
            <button
              key={appointment.id || appointment.appointment_id || index}
              onClick={() => onItemClick && onItemClick(appointment)}
              className="w-full text-left flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-lg font-bold text-gray-900">{time?.slice(0,5)}</div>
              </div>
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{patientName}</div>
                    <div className="text-sm text-gray-600">Dr. {doctorName}</div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1 capitalize">{String(type).replace('_',' ')}</div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button 
          onClick={() => onViewAll && onViewAll()}
          className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Ver agenda completa →
        </button>
      </div>
    </div>
  );
}
