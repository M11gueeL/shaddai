import React, { useState, useEffect, useMemo } from "react";
import { 
  User, Shield, MapPin, Calendar, Activity, 
  Award, Stethoscope, 
  History, Smartphone, Globe, CheckCircle2, 
  Copy, Monitor, Hash, CreditCard, Mail, Phone
} from "lucide-react";
import userApi from "../../../api/userApi";

export default function MyProfile({ profile }) {
  const [activeTab, setActiveTab] = useState(1);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const token = localStorage.getItem('token'); 
        const data = await userApi.getMyStats(token);
        setStats(data);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    if (profile?.id) {
        fetchStats();
    }
  }, [profile]);

  const roles = useMemo(() => Array.isArray(profile?.roles) ? profile.roles : [], [profile]);
  const isMedico = useMemo(() => {
      return roles.some(r => {
          const roleName = typeof r === 'string' ? r : r.name;
          return ["medico", "doctor", "doctora"].includes(String(roleName).toLowerCase());
      });
  }, [roles]);
  
  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`;

  const copyToClipboard = (text, key) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!profile) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold tracking-widest animate-pulse">CARGANDO PERFIL VIP...</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-slate-800 relative overflow-hidden">
      
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HEADER: Título y Bienvenida */}
        <div className="mb-12 relative">
          {/* Decorative background elements */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl -z-10 mix-blend-multiply animate-blob"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl -z-10 mix-blend-multiply animate-blob animation-delay-2000"></div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 ring-1 ring-indigo-100">
                  <User size={17} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold text-indigo-900/50">Mi Perfil</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-800 mb-3 leading-tight">
                Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">{profile.first_name.split(' ')[0]}</span>
              </h1>
              
              <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed">
                Bienvenido a tu panel de información personal.
              </p>
            </div>
            
            <div className="hidden md:flex flex-col items-end gap-3">
               <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-slate-100 shadow-sm text-slate-500 text-sm font-semibold hover:shadow-md transition-shadow cursor-default">
                  <Calendar size={16} className="text-indigo-500"/>
                  <span className="capitalize">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- COLUMNA IZQUIERDA: TARJETA CENTRALIZADA --- */}
          <div className="lg:col-span-4 space-y-8 sticky top-8">
            
            {/* TARJETA DE PERFIL (Target Style) */}
            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(79,70,229,0.15)] border border-indigo-50/50 overflow-hidden relative group transition-all duration-500 hover:shadow-[0_25px_60px_-12px_rgba(79,70,229,0.25)]">
              
              {/* Header Background */}
              <div className="h-36 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-600 via-purple-600 to-violet-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                  {/* Decoraciones sutiles de fondo */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500"></div>
              </div>
              
              <div className="px-8 pb-8 relative">
                  {/* Avatar Centrado (Estilo Target) */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                      <div className="w-32 h-32 rounded-full bg-white p-0.5 shadow-[0_10px_30px_rgba(79,70,229,0.3)] ring-4 ring-white relative z-10 group-hover:scale-[1.02] transition-transform duration-300">
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-4xl font-semibold tracking-wider shadow-inner">
                            {initials}
                          </div>
                      </div>
                  </div>

                  {/* Spacer para respetar el espacio del avatar */}
                  <div className="h-16"></div>

                  {/* Información del Usuario */}
                  <div className="mt-4 flex flex-col items-center text-center space-y-2">
                      <h2 className="text-3xl font-bold text-slate-800 tracking-tight leading-tight">
                          {profile.first_name} <span className="text-slate-600">{profile.last_name}</span>
                      </h2>
                      
                      <div className="flex flex-wrap justify-center gap-2 pt-1">
                          <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold uppercase tracking-wider border border-indigo-100 shadow-sm">
                              {roles.length > 0 ? (roles[0].name || roles[0]) : 'Usuario'}
                          </span>
                      </div>
                  </div>

                  {/* Sección de Cédula */}
                  <div className="mt-8">
                      <div className="flex items-center gap-5 p-5 bg-slate-50/80 rounded-2xl border border-slate-100/80 group/item hover:bg-indigo-50/50 hover:border-indigo-100/80 transition-all duration-300">
                          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-[0_4px_15px_-3px_rgba(79,70,229,0.15)] ring-1 ring-slate-100/50 group-hover/item:ring-indigo-200 group-hover/item:scale-105 transition-all shrink-0">
                              <CreditCard size={26} strokeWidth={1.5} className="group-hover/item:text-indigo-600 transition-colors"/>
                          </div>
                          <div className="flex-1 text-left">
                              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1 flex items-center gap-1">
                                Cédula de Identidad
                              </p>
                              <p className="font-mono text-xl font-black text-slate-800 tracking-wider leading-none">
                                  {profile.cedula || 'No registrado'}
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
            </div>

            {/* STATS MINI-GRID */}
            <div className="grid grid-cols-2 gap-4">
                <StatBox 
                    label="Sesiones Totales" 
                    value={loadingStats ? "-" : stats?.summary?.total} 
                    icon={Activity} 
                    color="indigo" 
                />
                <StatBox 
                    label="Este Mes" 
                    value={loadingStats ? "-" : stats?.summary?.month_count} 
                    icon={Calendar} 
                    color="purple" 
                />
            </div>
            
            {/* Quick Info Box */}
             <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contacto Rápido</h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <Mail size={14}/>
                        </div>
                        <span className="truncate">{profile.email}</span>
                        <button onClick={() => copyToClipboard(profile.email, 'email_quick')} className="ml-auto text-indigo-500 hover:text-indigo-700">
                             {copied === 'email_quick' ? <CheckCircle2 size={14}/> : <Copy size={14}/>}
                        </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <Phone size={14}/>
                        </div>
                        <span>{profile.phone}</span>
                    </div>
                </div>
             </div>

          </div>

          {/* --- COLUMNA DERECHA --- */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden min-h-[600px]">
                
                {/* Custom Tab Navigation */}
                <div className="px-8 py-8 border-b border-slate-100/80 flex items-center gap-8 overflow-x-auto scrollbar-hide">
                    <TabButton active={activeTab === 1} onClick={() => setActiveTab(1)} label="Información Personal" icon={User} />
                    {isMedico && <TabButton active={activeTab === 2} onClick={() => setActiveTab(2)} label="Perfil Médico" icon={Award} />}
                    <TabButton active={activeTab === 3} onClick={() => setActiveTab(3)} label="Seguridad y Actividad" icon={Shield} />
                </div>

                {/* Content Area */}
                <div className="p-8 bg-gradient-to-b from-white to-slate-50/50 min-h-[500px]">
                    
                    {/* TAB 1: PERSONAL */}
                    {activeTab === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                            <SectionHeader title="Datos Biográficos" subtitle="Información personal registrada en el sistema" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <PremiumField label="Nombre Completo" value={`${profile.first_name} ${profile.last_name}`} />
                                <PremiumField 
                                    label="Cédula de Identidad" 
                                    value={profile.cedula} 
                                    icon={Hash}
                                    onCopy={() => copyToClipboard(profile.cedula, 'ced')} 
                                    isCopied={copied === 'ced'} 
                                />
                                <PremiumField label="Fecha de Nacimiento" value={profile.birth_date} icon={Calendar} />
                                <PremiumField label="Género" value={profile.gender} />
                                <PremiumField 
                                    label="Correo Electrónico" 
                                    value={profile.email} 
                                    icon={Mail}
                                    onCopy={() => copyToClipboard(profile.email, 'mail')} 
                                    isCopied={copied === 'mail'} 
                                />
                                <PremiumField label="Teléfono" value={profile.phone} icon={Phone} />
                                <div className="md:col-span-2">
                                    <PremiumField label="Dirección de Habitación" value={profile.address} icon={MapPin} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: MEDICO */}
                    {activeTab === 2 && isMedico && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white shadow-lg mb-8">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Stethoscope size={120} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold">Certificación Profesional</h3>
                                    <p className="text-indigo-100 mt-1 text-sm">Sus credenciales han sido verificadas por la administración.</p>
                                </div>
                            </div>

                            <SectionHeader title="Colegiatura y Registros" subtitle="Datos oficiales del ejercicio médico" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Código MPPS</p>
                                    <p className="text-xl font-mono text-slate-800">{profile.medical_info?.mpps_code || '---'}</p>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">N° Colegio</p>
                                    <p className="text-xl font-mono text-slate-800">{profile.medical_info?.college_code || '---'}</p>
                                </div>
                                <div className="md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Colegio Médico</p>
                                    <div className="flex items-center gap-3">
                                        <Award className="text-indigo-500" size={20} />
                                        <p className="font-semibold text-slate-700">{profile.medical_info?.college_full_name || 'No registrado'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <SectionHeader title="Especialidades" subtitle="Áreas de práctica clínica" />
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {profile.specialties?.map((s, i) => (
                                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-100 rounded-lg shadow-sm text-indigo-700 font-medium text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                            {s.name || s}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ACTIVIDAD */}
                    {activeTab === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <SectionHeader title="Historial de Accesos" subtitle="Monitoreo de seguridad de tu cuenta" />
                            
                            <div className="mt-6 space-y-4">
                                {loadingStats ? (
                                    [1,2,3].map(i => <SkeletonRow key={i} />)
                                ) : (
                                    stats?.history?.map((session, idx) => (
                                        <div key={idx} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${session.device_info?.toLowerCase().includes('mobile') ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                                                    {session.device_info?.toLowerCase().includes('mobile') ? <Smartphone size={20} /> : <Monitor size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm sm:text-base line-clamp-1" title={session.device_info}>
                                                        {session.device_info || 'Dispositivo desconocido'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                                                            <Globe size={10} /> {session.ip_address}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0 pl-2">
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</p>
                                                    <p className="text-sm font-medium text-slate-700">{new Date(session.login_time).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</p>
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <span className={`w-2 h-2 rounded-full ${session.session_status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-300'}`}></span>
                                                        <span className="text-sm text-slate-700 font-medium">
                                                            {session.session_status === 'active' ? 'En línea' : new Date(session.login_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                
                                {(!loadingStats && (!stats?.history || stats.history.length === 0)) && (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                        <History size={48} className="opacity-20 mb-2" />
                                        <p>No hay historial de sesiones reciente.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES DE DISEÑO ---

const TabButton = ({ active, onClick, label, icon: Icon }) => (
    <button 
        onClick={onClick}
        className={`group flex items-center gap-2pb-4 transition-all duration-300 outline-none ${active ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
    >
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${active ? 'bg-indigo-50 text-indigo-700 font-bold ring-1 ring-indigo-200' : 'text-slate-600 font-medium'}`}>
            <Icon size={18} className={active ? 'text-indigo-600' : 'text-slate-400'} />
            <span className="whitespace-nowrap">{label}</span>
        </div>
    </button>
);

const StatBox = ({ label, value, icon: Icon, color }) => {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
    };
    return (
        <div className={`p-5 rounded-2xl border ${colors[color]} flex flex-col items-center justify-center text-center gap-2 shadow-sm transition-transform hover:-translate-y-1`}>
            <Icon size={24} className="opacity-80" />
            <span className="text-2xl font-semibold tracking-tight text-slate-800">{value}</span>
            <span className="text-[12px] font-bold tracking-wide opacity-70">{label}</span>
        </div>
    );
};

const PremiumField = ({ label, value, icon: Icon, onCopy, isCopied }) => (
    <div className="group relative p-4 rounded-xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon size={14} className="text-indigo-400" />}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-slate-700 truncate pr-4">{value || 'No registrado'}</span>
            {onCopy && value && (
                <button 
                    onClick={onCopy} 
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 shadow-sm"
                    title="Copiar"
                >
                    {isCopied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
            )}
        </div>
    </div>
);

const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
            {title}
        </h2>
        <p className="text-sm text-slate-500 mt-1 ml-3">{subtitle}</p>
    </div>
);

const SkeletonRow = () => (
    <div className="flex items-center p-4 bg-white rounded-xl border border-slate-100 gap-4">
        <div className="w-12 h-12 bg-slate-100 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse"></div>
            <div className="h-3 bg-slate-50 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="w-20 h-8 bg-slate-100 rounded animate-pulse"></div>
    </div>
);