import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getVerseOfTheDay } from "../../api/bibleApi";
import { 
  Clock, 
  Calendar, 
  User, 
  Users, 
  Stethoscope, 
  Wallet, 
  Package, 
  Shield, 
  Activity,
  ArrowRight,
  Sparkles,
  Quote,
  BadgeCheck
} from "lucide-react";

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [votd, setVotd] = useState(null);
  const [loadingVotd, setLoadingVotd] = useState(true);

  // --- Lógica de Datos ---

  useEffect(() => {
    const fetchVotd = async () => {
      try {
        const data = await getVerseOfTheDay();
        if (data && data.votd) setVotd(data.votd);
      } catch (error) {
        console.error("Error cargando versículo", error);
      } finally {
        setLoadingVotd(false);
      }
    };
    fetchVotd();
  }, []);

  // Reloj
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // --- Formatters ---

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const fullName = useMemo(() => {
    const first = (user?.first_name || "").trim();
    const last = (user?.last_name || "").trim();
    return toTitleCase(`${first} ${last}` || "Usuario");
  }, [user]);

  // Lógica para mostrar el Rol 
  const userRoleDisplay = useMemo(() => {
    if (!user || !user.roles || user.roles.length === 0) return "Usuario";
    
    // Detectamos el primer rol 
    const rawRole = typeof user.roles[0] === 'string' ? user.roles[0] : (user.roles[0].name || 'user');
    
    // Mapa de nombres "Brutales"
    const roleMap = {
      'admin': 'Administrador',
      'medico': 'Médico Especialista',
      'recepcionista': 'Gestión & Recepción',
      'doctor': 'Doctor',
    };
    
    // Retorna el nombre mapeado o el original capitalizado
    return roleMap[rawRole] || toTitleCase(rawRole);
  }, [user]);

  // Hora Militar con Segundos (HH:mm:ss)
  const timeString = now.toLocaleTimeString("es-VE", { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit", 
    hour12: false // Formato Militar
  });
  
  const dateString = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  // --- Accesos Directos ---
  const shortcuts = [
    {
      role: ["admin", "recepcionista"],
      to: "/reception",
      title: "Recepción",
      desc: "Gestión de pacientes",
      icon: Users,
      color: "bg-blue-600",
      gradient: "from-blue-600 to-cyan-500"
    },
    {
      role: ["admin", "medico"],
      to: "/medicalrecords",
      title: "Hist. Clínicas",
      desc: "Expedientes médicos",
      icon: Stethoscope,
      color: "bg-emerald-600",
      gradient: "from-emerald-600 to-teal-500"
    },
    {
      role: ["admin", "recepcionista"],
      to: "/payment",
      title: "Caja y Pagos",
      desc: "Control financiero",
      icon: Wallet,
      color: "bg-indigo-600",
      gradient: "from-indigo-600 to-violet-600"
    },
    {
      role: ["admin", "recepcionista"],
      to: "/inventory",
      title: "Inventario",
      desc: "Stock de insumos",
      icon: Package,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      role: ["admin"],
      to: "/controlpanel",
      title: "Panel Control",
      desc: "Sistema y usuarios",
      icon: Shield,
      color: "bg-slate-700",
      gradient: "from-slate-700 to-slate-900"
    },
  ];

  const activeShortcuts = shortcuts.filter(s => hasRole(s.role));

  // --- Limpieza de Texto del Versículo ---
  const cleanVerseText = (rawText) => {
    if (!rawText) return "";

    // 1. Decodificar entidades HTML (ej: &ldquo; -> ", &#237; -> í)
    // Usamos el DOMParser nativo del navegador para convertir el HTML a texto real
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawText, "text/html");
    let text = doc.body.textContent || "";

    // 2. Eliminar bloques de texto entre corchetes [Título]
    text = text.replace(/\[.*?\]/g, "");

    // 3. (Opcional) Eliminar comillas dobles al inicio y final si la API las trae
    // ya que tú probablemente quieras controlar el estilo de las comillas en tu UI.
    text = text.replace(/^["“]/, '').replace(/["”]$/, '');

    return text.trim();
  };

  return (
    <div className="min-h-full p-4 md:p-8 space-y-8 animate-fade-in">
      
      {/* --- GRID PRINCIPAL (Bento Layout) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. HERO CARD (Bienvenida + Info) - Ocupa 2 columnas */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white shadow-2xl p-8 md:p-10 flex flex-col justify-between min-h-[320px] group border border-white/5">
          
          {/* Efectos de Fondo (Glows) */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>
          
          {/* Contenido Superior */}
          <div className="relative z-10 space-y-5">
            {/* Badges de Estado */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-bold tracking-wider uppercase flex items-center gap-2 text-indigo-200">
                Panel Principal
              </span>
              {/* Badge del Rol */}
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-xs font-bold tracking-wider uppercase flex items-center gap-2 text-emerald-400 shadow-sm">
                <BadgeCheck className="w-3 h-3" />
                {userRoleDisplay}
              </span>
            </div>

            {/* Saludo Principal con Animación de Texto */}
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Hola, 
                <span className="ml-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-slate-300 to-blue-300 bg-[length:200%_auto] animate-gradient">
                  {fullName.split(' ')[0]}
                </span>
              </h1>
              {/* Mensaje BRUTAL */}
              <p className="mt-5 text-indigo-100/80 text-lg md:text-xl max-w-xl leading-relaxed font-light border-l-4 border-indigo-500 pl-5">
                Potencia tu gestión médica con precisión y elegancia. <br/>
                <span className="font-semibold text-white">Sistema Médico Shaddai</span> está listo para la excelencia.
              </p>
            </div>
          </div>

          {/* Contenido Inferior (Reloj Militar y Fecha) */}
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6 mt-10 pt-6 border-t border-white/10">
            <div className="flex items-center gap-4 group-hover:translate-x-2 transition-transform duration-500">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/5">
                <Clock className="w-8 h-8 text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold mb-0.5">Hora Actual</p>
                {/* Tabular-nums evita que los números bailen */}
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

        {/* 2. VERSE CARD  - Ocupa 1 columna */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-xl p-8 flex flex-col justify-center min-h-[320px]">
          {/* Decoración superior */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>
          <Quote className="absolute top-8 right-8 w-16 h-16 text-slate-50 rotate-180 transform scale-y-[-1]" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                Inspiración Diaria
              </h3>
              
              {loadingVotd ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-4/6"></div>
                </div>
              ) : votd ? (
                <blockquote className="text-2xl font-serif text-slate-700 italic leading-relaxed">
                  <span className="text-3xl text-emerald-500 font-bold leading-none mr-1 align-text-top">
                    “
                  </span>
                  
                  {cleanVerseText(votd.text)}
                  
                  <span className="text-3xl text-emerald-500 font-bold leading-none ml-1 align-text-bottom">
                    ”
                  </span>
                </blockquote>
              ) : (
                <p className="text-slate-400 italic text-xl">"Lámpara es a mis pies tu palabra, y lumbrera a mi camino."</p>
              )}
            </div>

            {votd && (
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="font-bold text-slate-800 text-sm bg-slate-100 px-4 py-1.5 rounded-full">
                  {votd.display_ref}
                </span>
                <a 
                  href={votd.permalink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
                >
                  Leer contexto 
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- GRID SECUNDARIO --- */}
      <div>
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            Accesos Rápidos
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {/* Card: Mi Perfil (Fija) */}
          <Link to="/profile" className="group relative overflow-hidden rounded-3xl bg-white p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-125 duration-500">
              <User className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div className="p-3.5 bg-slate-50 w-fit rounded-2xl text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-sm">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">Mi Perfil</h4>
                <p className="text-sm text-slate-500 mt-1 font-medium">Configuración personal</p>
              </div>
            </div>
          </Link>

          {/* Cards Dinámicas */}
          {activeShortcuts.map((item, idx) => (
            <Link 
              key={idx} 
              to={item.to} 
              className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300"
            >
              {/* Fondo Gradiente Animado */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Icono Grande Decorativo */}
              <div className="absolute -bottom-4 -right-4 p-4 opacity-[0.05] group-hover:opacity-20 transition-opacity group-hover:text-white group-hover:rotate-12 duration-500">
                <item.icon className="w-32 h-32" />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className={`p-3.5 w-fit rounded-2xl text-white shadow-lg shadow-indigo-500/20 ${item.color} group-hover:bg-white/20 group-hover:backdrop-blur-sm transition-all duration-300 ring-4 ring-white`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg group-hover:text-white transition-colors flex items-center justify-between">
                    {item.title}
                    <div className="bg-slate-100 rounded-full p-1 opacity-0 group-hover:opacity-100 group-hover:bg-white/20 transition-all duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </h4>
                  <p className="text-sm text-slate-500 mt-1 font-medium group-hover:text-white/90 transition-colors">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}