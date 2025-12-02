import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  UserCircle, 
  Contact, 
  Wallet, 
  Package, 
  FileHeart, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  X // Importamos el icono X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { hasRole, logout } = useAuth();

  const allMenuItems = [
    { 
      name: "Inicio", 
      path: "/dashboard", 
      roles: ['admin', 'medico', 'recepcionista'], 
      icon: LayoutDashboard 
    },
    { 
      name: "Mi Perfil", 
      path: "/profile", 
      roles: ['admin', 'medico', 'recepcionista'], 
      icon: UserCircle 
    },
    { 
      name: "Recepción", 
      path: "/reception", 
      roles: ['admin', 'recepcionista'], 
      icon: Contact 
    },
    { 
      name: "Caja y Pagos", 
      path: "/payment", 
      roles: ['admin', 'recepcionista'], 
      icon: Wallet 
    },
    { 
      name: "Inventario", 
      path: "/inventory", 
      roles: ['admin', 'recepcionista'], 
      icon: Package 
    },
    { 
      name: "Hist. Clínicas", 
      path: "/medicalrecords", 
      roles: ['admin', 'medico'], 
      icon: FileHeart 
    },
    { 
      name: "Panel Control", 
      path: "/controlpanel", 
      roles: ['admin'], 
      icon: Settings 
    },
  ];

  const menuItems = allMenuItems.filter(item => hasRole(item.roles));

  return (
    <>
      {/* Overlay para móviles (Cierra al hacer click fuera) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? "w-72 translate-x-0" : "w-24 -translate-x-full md:translate-x-0"}
        `}
      >
        {/* Contenedor Principal */}
        <div className="h-full flex flex-col bg-[#0f172a] border-r border-slate-800 shadow-2xl relative">
          
          {/* --- BOTONES DE CONTROL --- */}

          {/* 1. Botón Cerrar (X) SOLO PARA MÓVIL */}
          <button
            onClick={toggleSidebar}
            className="md:hidden absolute top-5 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 z-50"
            aria-label="Cerrar menú"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          {/* 2. Botón Toggle Flotante (Chevron) SOLO PARA DESKTOP */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex absolute -right-3 top-9 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-500 hover:scale-110 transition-all z-50 items-center justify-center"
          >
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* --- HEADER DEL SIDEBAR --- */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800/50 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 rounded-xl shrink-0 shadow-lg shadow-indigo-500/20">
                <Activity className="text-white w-6 h-6" />
              </div>
              <div className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0 md:hidden"}`}>
                <h1 className="text-white font-bold text-lg tracking-wide">Shaddai Rafa</h1>
                <p className="text-slate-400 text-xs font-medium">Sistema Médico Shaddai</p>
              </div>
            </div>
          </div>

          {/* --- NAVEGACIÓN (Scroll oculto aplicado aquí) --- */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 no-scrollbar">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                className={({ isActive }) => `
                  group relative flex items-center px-3 py-3 rounded-xl transition-all duration-300
                  ${isActive 
                    ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white" 
                    : "text-slate-400 hover:text-indigo-100 hover:bg-white/5"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* Indicador activo */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    )}

                    {/* Icono */}
                    <div className={`shrink-0 transition-colors duration-300 ${isActive ? "text-indigo-400" : "group-hover:text-indigo-300"}`}>
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    {/* Texto */}
                    <span 
                      className={`ml-4 text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden
                      ${isOpen ? "opacity-100 w-auto translate-x-0" : "opacity-0 w-0 -translate-x-4 hidden md:block"}`}
                    >
                      {item.name}
                    </span>

                    {/* Tooltip para Desktop Colapsado */}
                    {!isOpen && (
                      <div className="hidden md:block absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* --- FOOTER (Logout) --- */}
          <div className="p-4 shrink-0">
            <button
              onClick={logout}
              className={`flex items-center w-full p-2 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group overflow-hidden
                ${!isOpen && "md:justify-center"}
              `}
            >
              <LogOut size={20} className="shrink-0 transition-transform group-hover:-translate-x-1" />
              <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0 hidden md:block"}`}>
                Cerrar Sesión
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}