import React from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; // Importar contexto

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { hasRole } = useAuth();

  // Definir todas las opciones posibles con sus roles requeridos
  const allMenuItems = [
    { name: "Inicio", path: "/dashboard", roles: ['admin', 'medico', 'recepcionista'] },
    { name: "Mi Perfil", path: "/profile", roles: ['admin', 'medico', 'recepcionista'] },
    { name: "Recepción", path: "/reception", roles: ['admin', 'recepcionista'] },
    { name: "Caja", path: "/payment", roles: ['admin', 'recepcionista'] },
    { name: "Inventario", path: "/inventory", roles: ['admin', 'recepcionista'] },
    { name: "Historias Clínicas", path: "/medicalrecords", roles: ['admin', 'medico'] },
    { name: "Panel de Control", path: "/controlpanel", roles: ['admin'] },
  ];

  // Filtrar opciones basadas en los roles del usuario
  const menuItems = allMenuItems.filter(item => hasRole(item.roles));

  return (
    <div>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-xs md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`transform transition-transform duration-300 ease-in-out
          fixed md:sticky h-screen md:h-[calc(100vh-4rem)] top-16 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          left-0
        `}
      >
        <nav
          className={`h-full flex flex-col bg-gradient-to-bl from-slate-800 to-slate-900 shadow-xl
            ${isOpen ? "w-64" : "w-0 md:w-22"} 
            overflow-hidden transition-all duration-300
          `}
        >
          {/* Cabecera fija */}
          <div className={`${isOpen ? "pt-10 px-5" : "p-2"} transition-all relative shrink-0`}>
            <button
              onClick={toggleSidebar}
              className={`absolute top-9 right-4 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50
                ${isOpen ? "block" : "hidden md:block md:relative md:top-0 md:right-0 md:mx-auto md:my-4"}
              `}
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isOpen ? <FaTimes className="text-gray-900" /> : <FaBars className="text-gray-900" />}
            </button>

            <div className={`font-bold text-white mb-8 transition-all
              ${isOpen ? "text-2xl tracking-tight" : "text-center text-sm mt-8"}`}>
              {isOpen ? "Shaddai App" : "Shaddai APP"}
            </div>
          </div>
          
          {/* Contenido desplazable */}
          <div className="flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-2 px-4 pb-4">
              {menuItems.map(({ name, path }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `flex items-center p-2 mx-1 rounded-md transition
                       hover:bg-indigo-500 hover:text-white
                       ${isActive ? "bg-indigo-500 text-white font-semibold" : "text-indigo-100"}
                       ${!isOpen && "justify-center"}`
                    }
                    end
                  >
                    <span className={`${!isOpen && "hidden"}`}>{name}</span>
                    {!isOpen && (
                      <span className="text-xs font-medium truncate text-white" title={name}>
                        {name.charAt(0)}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>
    </div>
  );
}