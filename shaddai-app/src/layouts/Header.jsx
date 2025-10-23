import React from "react";
import { FaBars } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Header({ sidebarOpen, toggleSidebar }) {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-lg h-16 border-b border-gray-200">
      <div className="h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              onClick={toggleSidebar}
              aria-label="Abrir/cerrar menú"
            >
              <FaBars className="h-5 w-5" />
            </button>
            
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Sistema Médico Shaddai
            </h1>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={logout} 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-105 font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
