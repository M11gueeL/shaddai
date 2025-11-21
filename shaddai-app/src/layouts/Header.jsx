import React, { useState, useRef, useEffect } from "react";
import { Menu, ChevronDown, LogOut, User as UserIcon, Settings } from "lucide-react";
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

    const firstRole = user.roles[0]; // Tomamos solo el primero

    const roleMap = {
      admin: "Administrador",
      medico: "Médico",
      recepcionista: "Recepcionista",
    };

    return roleMap[firstRole] || firstRole; // Retorna el mapeo o el rol original si no coincide
  };

  const displayRole = getUserRole();

  // Generar iniciales usando first_name y last_name
  const getInitials = () => {
    if (!user) return "U";
    const first = user.first_name?.charAt(0) || "";
    const last = user.last_name?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button
              className="p-2 -ml-2 mr-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
              onClick={toggleSidebar}
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-3 select-none">
              <img 
                src="/shaddai_logo.png" 
                alt="Logo Shaddai" 
                className="h-16 w-16 object-contain drop-shadow-sm"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              
              <div className="flex flex-col justify-center">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-tight">
                  Shaddai Rafa
                </h1>
                <span className="text-xs font-medium text-slate-500 tracking-wider">
                  Sistema Médico Shaddai
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all duration-200 border ${
                  isDropdownOpen 
                    ? "bg-slate-50 border-blue-200 ring-2 ring-blue-100/50" 
                    : "bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                {/* Avatar con Iniciales */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white">
                  {getInitials()}
                </div>

                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-sm font-semibold text-slate-700 leading-none">
                    {displayName}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                    {displayRole}
                  </span>
                </div>

                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-100 ring-1 ring-black/5 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                  
                  <div className="px-4 py-3 border-b border-slate-100 md:hidden">
                    <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                    <p className="text-xs text-blue-600 font-medium">{displayRole}</p>
                  </div>

                  <div className="py-1">
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserIcon className="h-4 w-4 mr-3 text-slate-400 group-hover:text-blue-500" />
                      Mi Perfil
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 my-1"></div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-red-400 group-hover:text-red-500" />
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