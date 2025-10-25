import React from "react";
import { FaBars } from "react-icons/fa";

export default function Header({ sidebarOpen, toggleSidebar }) {
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

        </div>
      </div>
    </header>
  );
}
