import { UserPlus, CalendarPlus, Search, FileText } from 'lucide-react';

// Estilos base para tarjetas para mantener simetría y consistencia
const cardBase = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";

export default function QuickActionsCard({ onAction }) {
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
  ];

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
