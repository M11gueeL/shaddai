import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, Users, Activity } from 'lucide-react';

export default function ControlPanel() {
  const location = useLocation();
  
  const isUsersSection = location.pathname.includes('/controlpanel/users');
  const isSessionsSection = location.pathname.includes('/controlpanel/sessions');
  
  return (
    <div className="container mx-auto p-6">
      {/* Header informativo */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Panel de Control</h1>
              <p className="mt-1 text-sm md:text-base text-indigo-100">
                Administra usuarios, roles y monitorea la actividad de inicio de sesión en la plataforma.
              </p>
            </div>
            <div className="hidden sm:block opacity-90">
              <Shield className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
        <nav className="flex gap-2" aria-label="Panel de Control - Secciones">
          <Link
            to="/controlpanel/users"
            aria-selected={isUsersSection}
            className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition border ${
              isUsersSection
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 border-transparent'
            }`}
          >
            <Users className={`w-4 h-4 ${isUsersSection ? 'text-indigo-700' : 'text-gray-400 group-hover:text-gray-500'}`} />
            <span className="text-sm font-medium">Gestión de Usuarios</span>
          </Link>

          <Link
            to="/controlpanel/sessions"
            aria-selected={isSessionsSection}
            className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition border ${
              isSessionsSection
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 border-transparent'
            }`}
          >
            <Activity className={`w-4 h-4 ${isSessionsSection ? 'text-indigo-700' : 'text-gray-400 group-hover:text-gray-500'}`} />
            <span className="text-sm font-medium">Sesiones</span>
          </Link>

          <button
            className="ml-auto px-4 py-2 text-gray-400 cursor-not-allowed"
            disabled
            title="Próximamente"
          >
            Configuración del Sistema
          </button>
        </nav>
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <Outlet />
      </div>
    </div>
  );
}