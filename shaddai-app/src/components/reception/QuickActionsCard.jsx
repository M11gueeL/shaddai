import { UserPlus, CalendarPlus, Search, FileText, Clock } from 'lucide-react';

// Estilos base para tarjetas para mantener simetría y consistencia
const cardBase = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";

export default function QuickActionsCard({ onAction, horizontal = false }) {
  const actions = [
    {
      id: 'register',
      title: 'Registrar Paciente',
      icon: UserPlus,
      color: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-200',
      description: 'Nuevo paciente',
    },
    {
      id: 'schedule',
      title: 'Agendar Cita',
      icon: CalendarPlus,
      color: 'bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-rose-700 shadow-pink-200',
      description: 'Nueva cita',
    },
    {
      id: 'list',
      title: 'Buscar Pacientes',
      icon: Search,
      color: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-200',
      description: 'Ver listado',
    },
    {
      id: 'consult',
      title: 'Consultar Citas',
      icon: FileText,
      color: 'bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-rose-700 shadow-pink-200',
      description: 'Ver agenda',
    },
    {
      id: 'medicalSchedules',
      title: 'Horarios Médicos',
      icon: Clock,
      color: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-200',
      description: 'Gestionar horarios',
    },
  ];

  if (horizontal) {
    return (
      <div className={cardBase}>
        <div className="flex items-center justify-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900 pb-2">Acciones Rápidas</h3>
        </div>
        <div className="-mx-2 px-2">
          <div className="flex gap-3 flex-wrap justify-center">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onAction(action.id)}
                  className={`flex items-center gap-2 ${action.color} text-white px-5 py-3 rounded-xl whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 active:scale-95`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{action.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardBase}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`w-full ${action.color} text-white p-4 h-16 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="bg-white/20 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1 z-10">
                <div className="font-bold text-lg tracking-wide">{action.title}</div>
                <div className="text-xs text-blue-50/90 font-medium">{action.description}</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
