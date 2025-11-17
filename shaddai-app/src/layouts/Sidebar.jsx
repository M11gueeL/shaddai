import React from "react";
import { NavLink } from "react-router-dom";
import { 
  FaBars, 
  FaArrowLeft, 
  FaHome, 
  FaUser, 
  FaUserNurse, 
  FaCashRegister, 
  FaBoxes, 
  FaFileMedical, 
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { hasRole, logout } = useAuth();

  const allMenuItems = [
    { 
      name: "Inicio", 
      path: "/dashboard", 
      roles: ['admin', 'medico', 'recepcionista'], 
      icon: FaHome 
    },
    { 
      name: "Mi Perfil", 
      path: "/profile", 
      roles: ['admin', 'medico', 'recepcionista'], 
      icon: FaUser 
    },
    { 
      name: "Recepción", 
      path: "/reception", 
      roles: ['admin', 'recepcionista'], 
      icon: FaUserNurse 
    },
    { 
      name: "Caja", 
      path: "/payment", 
      roles: ['admin', 'recepcionista'], 
      icon: FaCashRegister 
    },
    { 
      name: "Inventario", 
      path: "/inventory", 
      roles: ['admin', 'recepcionista'], 
      icon: FaBoxes 
    },
    { 
      name: "Historias Clínicas", 
      path: "/medicalrecords", 
      roles: ['admin', 'medico'], 
      icon: FaFileMedical 
    },
    { 
      name: "Panel de Control", 
      path: "/controlpanel", 
      roles: ['admin'], 
      icon: FaCog 
    },
  ];

  const menuItems = allMenuItems.filter(item => hasRole(item.roles));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-brightness-50 backdrop-blur-xs bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`transform transition-transform duration-300 ease-in-out h-screen top-0 left-0 z-50
          fixed md:fixed  
          ${isOpen 
            ? "translate-x-0" 
            : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <nav
          className={`h-full flex flex-col bg-gradient-to-bl from-slate-800 to-slate-900 shadow-2xl
            transition-all duration-300
            ${isOpen ? "md:w-64 w-104" : "w-64 md:w-20"} 
          `}
        >
          {/* Cabecera */}
          <div className={`${isOpen ? "pt-6 px-5" : "pt-6 px-2"} transition-all relative shrink-0`}>
            <button
              onClick={toggleSidebar}
              className={`absolute top-4 right-4 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors
                ${isOpen ? "block" : "hidden md:block md:relative md:top-0 md:right-0 md:mx-auto md:my-4"}
              `}
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isOpen ? <FaArrowLeft className="text-gray-900 w-4 h-4" /> : <FaBars className="text-gray-900 w-4 h-4" />}
            </button>

            <div className={`font-bold text-white mb-8 transition-all
              ${isOpen ? "text-2xl tracking-tight" : "text-center text-xs mt-8 md:block hidden"}`}>
              {isOpen ? "Shaddai" : ""}
            </div>
          </div>
          
          {/* Contenido desplazable */}
          <div className="flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-2 px-4 pb-4">
              {menuItems.map(({ name, path, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        toggleSidebar();
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center p-3 mx-1 rounded-lg transition-all duration-200
                       hover:bg-indigo-500 hover:text-white hover:shadow-lg group
                       ${isActive ? "bg-indigo-500 text-white font-semibold shadow-lg" : "text-indigo-100"}
                       ${!isOpen && "md:justify-center"}`
                    }
                    end
                  >
                    {/* Icono siempre visible */}
                    <Icon className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 ${
                      isOpen ? "mr-3" : "md:mr-0"
                    }`} />
                    
                    {/* Texto solo cuando está abierto */}
                    <span className={`text-sm font-medium transition-all duration-200 ${
                      !isOpen && "md:hidden"
                    }`}>
                      {name}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer del sidebar */}
          <div className={`${isOpen ? "p-4" : "p-2"} border-t border-slate-700`}
          >
            {/* Info de versión */}
            <div className={`text-center ${!isOpen && "md:hidden"}`}>
              <p className="text-slate-400 text-xs">Versión Beta</p>
              <p className="text-slate-500 text-xs">Sistema Médico Shaddai</p>
            </div>

            {/* Botón de cerrar sesión al final */}
            <button
              onClick={logout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className={`mt-3 w-full flex items-center ${isOpen ? "justify-center gap-2" : "justify-center"} 
                p-3 rounded-lg border border-red-500 text-red-400 
                hover:bg-red-600 hover:text-white hover:border-red-600 
                transition-all duration-200 hover:shadow-lg`}
            >
              <FaSignOutAlt className="w-5 h-5" />
              {isOpen && <span className="text-sm font-medium">Cerrar sesión</span>}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
