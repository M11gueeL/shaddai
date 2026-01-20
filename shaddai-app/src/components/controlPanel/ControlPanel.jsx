import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, Users, Activity, DownloadCloud, DoorOpen, LayoutGrid } from 'lucide-react';
import ElegantHeader from '../common/ElegantHeader';
import ControlPanelHome from './ControlPanelHome';

export default function ControlPanel() {
  const location = useLocation();
  
  // Detectar en qué sección estamos
  const isUsersSection = location.pathname.includes('/controlpanel/users');
  const isRoomsSection = location.pathname.includes('/controlpanel/rooms');
  const isSessionsSection = location.pathname.includes('/controlpanel/sessions');
  const isBackupSection = location.pathname.includes('/controlpanel/backup');
  
  // Detectar si estamos en la raíz del panel (para mostrar la vista por defecto)
  const isRootPath = location.pathname === '/controlpanel' || location.pathname === '/controlpanel/';

  // Clase base para los tabs
  const tabClass = (isActive) => `
    group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm border
    ${isActive 
      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 border-indigo-600' 
      : 'bg-white text-slate-600 border-transparent hover:bg-indigo-50 hover:text-indigo-700'
    }
  `;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Consistente (Estilo Recepción) */}
        <ElegantHeader 
          icon={Shield}
          sectionName="Administrador"
          title="Panel de"
          highlightText="Control"
          description="Centro de mando para la gestión de usuarios, seguridad, consultorios y configuración global del sistema."
        />

        {/* Tabs de navegación Mejorados */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-2 mb-8 sticky top-4 z-30">
          <nav className="flex flex-wrap gap-2" aria-label="Panel de Control - Secciones">
            
            {/* Tab de Inicio/General */}
            <Link
              to="/controlpanel"
              className={tabClass(isRootPath)}
            >
              <LayoutGrid size={18} />
              <span>General</span>
            </Link>

            <div className="w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <Link
              to="/controlpanel/users"
              aria-selected={isUsersSection}
              className={tabClass(isUsersSection)}
            >
              <Users size={18} />
              <span>Usuarios</span>
            </Link>

            <Link
              to="/controlpanel/rooms"
              aria-selected={isRoomsSection}
              className={tabClass(isRoomsSection)}
            >
              <DoorOpen size={18} />
              <span>Consultorios</span>
            </Link>

            <Link
              to="/controlpanel/sessions"
              aria-selected={isSessionsSection}
              className={tabClass(isSessionsSection)}
            >
              <Activity size={18} />
              <span>Sesiones</span>
            </Link>

            <Link
              to="/controlpanel/backup"
              aria-selected={isBackupSection}
              className={tabClass(isBackupSection)}
            >
              <DownloadCloud size={18} />
              <span>Respaldos</span>
            </Link>
          </nav>
        </div>

        {/* Contenido Dinámico */}
        <div className="transition-all duration-300">
          {isRootPath ? (
            <ControlPanelHome />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-300">
              <Outlet />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}