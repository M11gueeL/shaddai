import { UserPlus, CalendarPlus, Search, FileText, Clock } from 'lucide-react';

// Estilos base para tarjetas para mantener simetría y consistencia
const cardBase = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";

export default function QuickActionsCard({ onAction, horizontal = false }) {
  const actions = [
    {
      id: 'register',
      title: 'Registrar Paciente',
      icon: UserPlus,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Nuevo paciente',
    },
    {
      id: 'schedule',
      title: 'Agendar Cita',
      icon: CalendarPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Nueva cita',
    },
    {
      id: 'list',
      title: 'Buscar Pacientes',
      icon: Search,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Ver listado',
    },
    {
      id: 'consult',
      title: 'Consultar Citas',
      icon: FileText,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Ver agenda',
    },
    {
      id: 'medicalSchedules',
      title: 'Horarios Médicos',
      icon: Clock,
      color: 'bg-teal-600 hover:bg-teal-700',
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
                  className={`flex items-center gap-2 ${action.color} text-white px-4 py-3 rounded-xl whitespace-nowrap hover:shadow-lg transition-all`}
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
              className={`w-full ${action.color} text-white p-4 h-14 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center group`}
            >
              <Icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left flex-1">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
