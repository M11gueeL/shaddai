import React from 'react';
import { UserPlus, CalendarPlus, Search, FileText, Clock, ArrowRight, Sparkles } from 'lucide-react';

export default function QuickActionsCard({ onAction, horizontal = false }) {
  const actions = [
    {
      id: 'register',
      title: 'Registrar Paciente',
      icon: UserPlus,
      description: 'Nuevo ingreso',
      gradient: 'from-indigo-500 via-indigo-600 to-violet-600',
      shadow: 'shadow-indigo-500/20',
      iconColor: 'text-indigo-100',
      bgIcon: 'bg-indigo-400/20'
    },
    {
      id: 'schedule',
      title: 'Agendar Cita',
      icon: CalendarPlus,
      description: 'Programar consulta',
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-600',
      shadow: 'shadow-violet-500/20',
      iconColor: 'text-violet-100',
      bgIcon: 'bg-violet-400/20'
    },
    {
      id: 'list',
      title: 'Buscar Pacientes',
      icon: Search,
      description: 'Directorio general',
      gradient: 'from-fuchsia-500 via-pink-600 to-rose-500',
      shadow: 'shadow-fuchsia-500/20',
      iconColor: 'text-fuchsia-100',
      bgIcon: 'bg-fuchsia-400/20'
    },
    {
      id: 'consult',
      title: 'Consultar Citas',
      icon: FileText,
      description: 'Agenda del día',
      gradient: 'from-rose-500 via-orange-500 to-amber-500',
      shadow: 'shadow-rose-500/20',
      iconColor: 'text-rose-100',
      bgIcon: 'bg-rose-400/20'
    },
    {
      id: 'medicalSchedules',
      title: 'Horarios Médicos',
      icon: Clock,
      description: 'Gestión de turnos',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      shadow: 'shadow-cyan-500/20',
      iconColor: 'text-cyan-100',
      bgIcon: 'bg-cyan-400/20'
    },
  ];

  if (horizontal) {
    return (
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onAction(action.id)}
                className={`
                  group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300
                  bg-gradient-to-br ${action.gradient}
                  hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]
                  ${action.shadow}
                `}
              >
                {/* Decorative background circles */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-all duration-500 group-hover:bg-white/20" />
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-black/5 blur-xl" />

                <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-xl p-2.5 backdrop-blur-md ${action.bgIcon} border border-white/10`}>
                      <Icon className={`h-6 w-6 ${action.iconColor}`} strokeWidth={2} />
                    </div>
                    <div className="opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
                        <div className="rounded-full bg-white/20 p-1.5 backdrop-blur-sm">
                            <ArrowRight className="h-3.5 w-3.5 text-white" />
                        </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight mb-0.5 tracking-tight">
                      {action.title}
                    </h3>
                    <p className="text-white/80 text-xs font-medium">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        Acciones Rápidas
      </h3>
      <div className="flex flex-col gap-3 flex-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`
                w-full group relative overflow-hidden rounded-xl transition-all duration-300
                bg-gradient-to-r ${action.gradient}
                hover:shadow-lg hover:scale-[1.02] hover:z-10
                flex-1 flex items-center px-4
              `}
            >
              <div className="relative z-10 flex items-center gap-3 w-full">
                <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm shrink-0">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-bold text-white text-sm truncate">{action.title}</div>
                  <div className="text-xs text-white/80 truncate">{action.description}</div>
                </div>
                <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
