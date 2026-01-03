import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext"; 
import { Clock, Calendar, BadgeCheck } from "lucide-react";

export default function WelcomeCard() {
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const fullName = useMemo(() => {
    const first = (user?.first_name || "").trim();
    return toTitleCase(first || "Usuario");
  }, [user]);

  const userRoleDisplay = useMemo(() => {
    if (!user || !user.roles || user.roles.length === 0) return "Usuario";
    const rawRole = typeof user.roles[0] === 'string' ? user.roles[0] : (user.roles[0].name || 'user');
    const roleMap = {
      'admin': 'Administrador',
      'medico': 'Médico Especialista',
      'recepcionista': 'Gestión & Recepción',
      'doctor': 'Doctor',
    };
    return roleMap[rawRole] || toTitleCase(rawRole);
  }, [user]);

  const timeString = now.toLocaleTimeString("es-VE", { 
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true 
  });
  
  const dateString = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white shadow-2xl p-8 md:p-10 flex flex-col justify-between min-h-[320px] h-full group border border-white/5">
      {/* Efectos de Fondo */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>
      
      {/* Contenido Superior */}
      <div className="relative z-10 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-bold tracking-wider uppercase flex items-center gap-2 text-indigo-200">
            Panel Principal
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-xs font-bold tracking-wider uppercase flex items-center gap-2 text-emerald-400 shadow-sm">
            <BadgeCheck className="w-3 h-3" />
            {userRoleDisplay}
          </span>
        </div>

        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Hola, 
            <span className="ml-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-slate-300 to-blue-300 bg-[length:200%_auto] animate-gradient">
              {fullName}
            </span>
          </h1>
          <p className="mt-5 text-indigo-100/80 text-lg md:text-xl max-w-xl leading-relaxed font-light border-l-4 border-indigo-500 pl-5">
            Potencia tu gestión médica con precisión y elegancia. <br/>
            <span className="font-semibold text-white">Sistema Médico Shaddai</span> está listo para la excelencia.
          </p>
        </div>
      </div>

      {/* Contenido Inferior */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-6 mt-10 pt-6 border-t border-white/10">
        <div className="flex items-center gap-4 group-hover:translate-x-2 transition-transform duration-500">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/5">
            <Clock className="w-8 h-8 text-indigo-300" />
          </div>
          <div>
            <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold mb-0.5">Hora Actual</p>
            <p className="text-4xl font-mono font-bold text-white tracking-tight tabular-nums shadow-black drop-shadow-lg">
              {timeString}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-indigo-200 bg-black/20 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/5">
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium capitalize">{dateString}</span>
        </div>
      </div>
    </div>
  );
}