import React from 'react';
import { Users, DoorOpen, Activity, DownloadCloud, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ControlPanelHome() {
  const cards = [
    {
      title: 'Gestión de Usuarios',
      desc: 'Administra cuentas, roles y permisos de acceso al sistema.',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/controlpanel/users'
    },
    {
      title: 'Consultorios',
      desc: 'Configura la disponibilidad y asignación de consultorios físicos.',
      icon: DoorOpen,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      link: '/controlpanel/rooms'
    },
    {
      title: 'Monitoreo de Sesiones',
      desc: 'Supervisa la actividad reciente y los inicios de sesión activos.',
      icon: Activity,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      link: '/controlpanel/sessions'
    },
    {
      title: 'Respaldos del Sistema',
      desc: 'Gestiona copias de seguridad de la base de datos.',
      icon: DownloadCloud,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/controlpanel/backup'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Bienvenido al Centro de Administración</h2>
            <p className="mt-2 text-slate-600 max-w-2xl text-lg leading-relaxed">
              Desde este panel tienes control total sobre la infraestructura operativa de Shaddai. 
              Selecciona un módulo arriba o abajo para comenzar a gestionar los recursos del sistema.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, idx) => (
          <Link 
            key={idx} 
            to={card.link}
            className="group relative p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-200"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={24} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                  {card.title}
                </h3>
                <p className="mt-1 text-slate-500 text-sm">
                  {card.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}