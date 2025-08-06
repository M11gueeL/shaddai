import React from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const menuItems = [
  { name: "Inicio", path: "/dashboard" },
  { name: "Mi Perfil", path: "/profile" },
  { name: "Recepción", path: "/reception" },
  { name: "Caja", path: "/payment" },
  { name: "Inventario", path: "/inventory" },
  { name: "Historias Clínicas", path: "/medicalrecords" },
  { name: "Panel de Control", path: "/controlpanel" },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <div>
      {/* Overlay con efecto de desenfoque para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-xs md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`transform transition-transform duration-300 ease-in-out
          fixed md:relative z-50 h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          top-0 left-0
        `}
      >
        <nav
          className={`h-full flex flex-col bg-gradient-to-bl from-slate-800 to-slate-900 shadow-xl
            ${isOpen ? "w-64" : "w-0 md:w-22"} 
            overflow-hidden transition-all duration-300
          `}
        >
          <div className={`${isOpen ? "py-10 px-5" : "p-2"} transition-all`}>
            {/* Botón de toggle */}
            <button
              onClick={toggleSidebar}
              className={`absolute top-9 right-4 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50
                ${isOpen ? "block" : "hidden md:block md:relative md:top-0 md:right-0 md:mx-auto md:my-4"}
              `}
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isOpen ? <FaTimes className="text-gray-900" /> : <FaBars className="text-gray-900" />}
            </button>

            {/* Logo/Título */}
            <div className={`font-bold text-white mb-8 transition-all
              ${isOpen ? "text-2xl tracking-tight" : "text-center text-sm mt-8"}`}>
              {isOpen ? "Shaddai App" : "Shaddai APP"}
            </div>

            {/* Opciones menú */}
            <ul className="flex flex-col gap-2">
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