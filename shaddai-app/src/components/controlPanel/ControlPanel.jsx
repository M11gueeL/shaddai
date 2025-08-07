import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function ControlPanel() {
  const location = useLocation();
  
  // Determinar si estamos en una subruta de usuarios
  const isUsersSection = location.pathname.includes('/controlpanel/users');
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Control</h1>
      
      {/* Menú de navegación */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <ul className="flex space-x-4 border-b border-gray-200 pb-2">
          <li>
            <Link 
              to="/controlpanel/users" 
              className={`px-4 py-2 rounded-md transition ${
                isUsersSection
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Gestión de Usuarios
            </Link>
          </li>
          {/* Agregar más opciones aquí en el futuro */}
          <li>
            <button 
              className="px-4 py-2 text-gray-400 cursor-not-allowed"
              disabled
              title="Próximamente"
            >
              Configuración del Sistema
            </button>
          </li>
        </ul>
      </div>
      
      {/* Contenedor para subrutas */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Outlet />
      </div>
    </div>
  );
}