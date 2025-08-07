import React from "react";
import { FaBars } from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; // Importa el hook de auth

export default function Header({ sidebarOpen, toggleSidebar }) {
  const { logout } = useAuth(); // Obtiene la función logout desde el contexto

  return (
    <header className="bg-white shadow h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Botón para mostrar sidebar en móvil */}
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none mr-4"
              onClick={toggleSidebar}
              aria-label="Abrir menú"
            >
              <FaBars className="h-6 w-6" />
            </button>
            
            {/* Título de la aplicación */}
            <h1 className="text-xl font-bold text-gray-900">Shaddai</h1>
          </div>
          
          {/* Botón de cerrar sesión */}
          <div className="flex items-center">
            <button 
              onClick={logout} 
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}