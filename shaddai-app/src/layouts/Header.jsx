import React, { useState, useRef, useEffect } from "react";
import { Menu, ChevronDown, LogOut, User as UserIcon, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Header({ sidebarOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (logout) logout();
  };

  const displayName = user?.first_name || "Usuario";

  const getUserRole = () => {
    if (!user || !user.roles || user.roles.length === 0) return "Usuario";
    const firstRole = user.roles[0];
    const roleMap = {
      admin: "Administrador",
      medico: "Médico",
      recepcionista: "Recepcionista",
    };
    return roleMap[firstRole] || firstRole;
  };

  const displayRole = getUserRole();

  const getInitials = () => {
    if (!user) return "U";
    const first = user.first_name?.charAt(0) || "";
    const last = user.last_name?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl transition-all duration-300">
      
      {/* Línea decorativa inferior con gradiente sutil */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* --- SECCIÓN IZQUIERDA: MENÚ Y LOGO --- */}
          <div className="flex items-center gap-4">
            {/* Botón Hamburguesa (Solo Móvil) */}
            <button
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors md:hidden"
              onClick={toggleSidebar}
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-3 select-none group">
              {/* Logo con efecto hover sutil */}
              <div className="relative transition-transform duration-500 group-hover:scale-105">
                <div className="absolute inset-0 bg-indigo-400 blur-lg opacity-20 rounded-full"></div>
                <img 
                  src="/shaddai_logo.png" 
                  alt="Logo Shaddai" 
                  className="h-12 w-12 object-contain relative z-10"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              
              <div className="flex flex-col justify-center">
                <h1 className="text-xl font-bold tracking-tight leading-none">
                  <span className="text-slate-800">Shaddai</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 ml-1">
                    Rafa
                  </span>
                </h1>
                <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mt-0.5">
                  Sistema Médico Shaddai
                </span>
              </div>
            </div>
          </div>

          {/* --- SECCIÓN DERECHA: PERFIL --- */}
          <div className="flex items-center gap-4" ref={dropdownRef}>

            {/* Dropdown Wrapper */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`
                  flex items-center gap-3 pl-1 pr-1 py-1 rounded-full transition-all duration-300
                  border border-transparent
                  ${isDropdownOpen 
                    ? "bg-white border-indigo-100 shadow-md ring-2 ring-indigo-50" 
                    : "hover:bg-slate-50 hover:border-slate-200 border-slate-100/50"
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                    {getInitials()}
                  </div>
                  {/* Indicador Online */}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                {/* Texto (Desktop) */}
                <div className="hidden md:flex flex-col items-start mr-2 text-left">
                  <span className="text-sm font-bold text-slate-700 leading-none">
                    {displayName}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-500 mt-0.5 tracking-wide">
                    {displayRole}
                  </span>
                </div>

                <div className="pr-2 hidden md:block">
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-indigo-500" : ""}`} />
                </div>
              </button>

              {/* Menú Desplegable */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-100 ring-1 ring-black/5 py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                  
                  {/* Info Móvil */}
                  <div className="px-4 py-3 border-b border-slate-100 md:hidden text-center bg-slate-50/50">
                    <div className="h-10 w-10 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md mb-1.5">
                      {getInitials()}
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                    <p className="text-[11px] text-indigo-600 font-semibold tracking-wide">{displayRole}</p>
                  </div>

                  {/* Opciones */}
                  <div className="p-1 space-y-0.5">
                    <Link 
                      to="/profile" 
                      className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="p-1 bg-slate-100 text-slate-500 rounded group-hover:bg-indigo-100 group-hover:text-indigo-600 mr-2.5 transition-colors">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      Mi Perfil
                    </Link>
                  </div>

                  <div className="h-px bg-slate-100 my-1 mx-2"></div>

                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group"
                    >
                      <div className="p-1 bg-slate-100 text-slate-500 rounded group-hover:bg-red-100 group-hover:text-red-500 mr-2.5 transition-colors">
                        <LogOut className="h-4 w-4" />
                      </div>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}