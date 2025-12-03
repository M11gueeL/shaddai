import React, { useState, useEffect, useMemo } from "react";
import { 
  User, Shield, MapPin, Calendar, Activity, 
  Fingerprint, Award, Stethoscope, 
  History, Smartphone, Globe, CheckCircle2, 
  Copy, Monitor
} from "lucide-react";

// CORRECCIÓN AQUÍ: Importamos el objeto por defecto 'userApi'
import userApi from "../../../api/userApi"; 

export default function MyProfile({ profile }) {
  const [activeTab, setActiveTab] = useState(1);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // CORRECCIÓN AQUÍ: Llamamos a userApi.getMyStats()
        // Pasamos null si tu api lee directo del localStorage, o pasamos el token si lo tienes en contexto
        const token = localStorage.getItem('token'); 
        const data = await userApi.getMyStats(token);
        setStats(data);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    // Solo cargar stats si hay un perfil
    if (profile?.id) {
        fetchStats();
    }
  }, [profile]);

  // Lógica de Roles segura
  const roles = useMemo(() => Array.isArray(profile?.roles) ? profile.roles : [], [profile]);
  
  // Detectar si es médico (maneja string o objeto role)
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

  if (!profile) return <div className="p-10 text-center text-gray-500 animate-pulse">Cargando perfil...</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* TARJETA IZQUIERDA (BLACK CARD) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group h-96 w-full rounded-3xl bg-slate-900 text-white shadow-2xl overflow-hidden transition-all hover:scale-[1.01] duration-500">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl group-hover:bg-indigo-500/40 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black via-slate-900 to-transparent"></div>
            
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                  <Fingerprint className="text-indigo-400" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Estado</p>
                  <div className={`flex items-center gap-1.5 justify-end font-bold text-sm ${profile.active ? 'text-emerald-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${profile.active ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                    {profile.active ? 'ACTIVO' : 'INACTIVO'}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 mb-4 shadow-lg shadow-indigo-500/20">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold tracking-widest uppercase border border-white/10">
                    {initials}
                  </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{profile.first_name}</h2>
                <p className="text-slate-400 font-light">{profile.last_name}</p>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Rol Principal</p>
                  <p className="text-sm font-medium text-indigo-300 capitalize">
                    {roles.length > 0 ? (roles[0].name || roles[0]) : 'Usuario'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">ID Sistema</p>
                  <p className="font-mono text-lg tracking-widest">#{String(profile.id).padStart(4, '0')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center transition-colors">
              <Activity className="text-indigo-500 mb-2" size={20} />
              <span className="text-2xl font-bold text-slate-800">
                {loadingStats ? "-" : stats?.summary?.total || 0}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Sesiones Totales</span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center transition-colors">
              <Calendar className="text-purple-500 mb-2" size={20} />
              <span className="text-2xl font-bold text-slate-800">
                {loadingStats ? "-" : stats?.summary?.month_count || 0}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Este Mes</span>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: TABS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-8 border-b border-slate-200 pb-1 overflow-x-auto scrollbar-hide">
            <button 
                onClick={() => setActiveTab(1)} 
                className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap ${activeTab === 1 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Información Personal
              {activeTab === 1 && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            {isMedico && (
              <button 
                onClick={() => setActiveTab(2)} 
                className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap ${activeTab === 2 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Credenciales Médicas
                {activeTab === 2 && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
              </button>
            )}
            <button 
                onClick={() => setActiveTab(3)} 
                className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap ${activeTab === 3 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Historial de Actividad
              {activeTab === 3 && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[400px] animate-in fade-in zoom-in-95 duration-300">
            
            {/* TAB 1 */}
            {activeTab === 1 && (
              <div className="space-y-8">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="text-indigo-500" size={20} /> Datos del Perfil
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <DataField label="Nombre Completo" value={`${profile.first_name} ${profile.last_name}`} />
                  <DataField label="Cédula" value={profile.cedula} copyable onCopy={() => copyToClipboard(profile.cedula, 'ced')} isCopied={copied === 'ced'} />
                  <DataField label="Email" value={profile.email} copyable onCopy={() => copyToClipboard(profile.email, 'mail')} isCopied={copied === 'mail'} />
                  <DataField label="Teléfono" value={profile.phone} />
                  <DataField label="Fecha Nacimiento" value={profile.birth_date} />
                  <DataField label="Género" value={profile.gender} />
                  <div className="md:col-span-2">
                    <DataField label="Dirección" value={profile.address} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2 */}
            {activeTab === 2 && isMedico && (
              <div className="space-y-8">
                <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 to-indigo-50 p-6 rounded-2xl border border-sky-100">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-sky-600 shadow-sm border border-sky-100">
                       <Award size={24} />
                     </div>
                     <div>
                       <h4 className="font-bold text-sky-900 text-lg">Información Profesional</h4>
                       <p className="text-sky-700/80 text-sm">Datos verificados de colegiatura</p>
                     </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DataField label="Código MPPS" value={profile.medical_info?.mpps_code} />
                    <DataField label="Código Colegio" value={profile.medical_info?.college_code} />
                    <div className="md:col-span-2">
                        <DataField label="Colegio Médico" value={profile.medical_info?.college_full_name} />
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Stethoscope className="text-pink-500" size={20} /> Especialidades
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {profile.specialties?.map((s, i) => (
                            <span key={i} className="px-4 py-2 bg-pink-50 text-pink-700 rounded-xl text-sm font-medium border border-pink-100">
                                {s.name || s}
                            </span>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {/* TAB 3 */}
            {activeTab === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <History className="text-indigo-500" size={20} /> Últimos Accesos
                </h3>
                
                {loadingStats ? (
                   <div className="space-y-3">
                     {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>)}
                   </div>
                ) : (
                   <div className="space-y-3">
                     {stats?.history?.map((session, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-all">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                             {session.device_info?.toLowerCase().includes('mobile') ? <Smartphone size={18} /> : <Monitor size={18} />}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]" title={session.device_info}>
                                {session.device_info || 'Dispositivo desconocido'}
                             </p>
                             <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                <Globe size={10} /> {session.ip_address}
                             </p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-sm font-medium text-slate-600">
                             {new Date(session.login_time).toLocaleDateString()}
                           </p>
                           <div className="flex items-center justify-end gap-1.5">
                             <span className={`w-1.5 h-1.5 rounded-full ${session.session_status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                             <p className="text-xs text-slate-400 capitalize">
                               {new Date(session.login_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                             </p>
                           </div>
                         </div>
                       </div>
                     ))}
                     {(!stats?.history || stats.history.length === 0) && (
                       <div className="text-center py-12 text-slate-400 italic border-2 border-dashed border-slate-100 rounded-xl">
                         No se encontró historial reciente.
                       </div>
                     )}
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const DataField = ({ label, value, copyable, onCopy, isCopied }) => (
  <div className="group">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
    <div className="flex items-center justify-between border-b border-slate-200 pb-2 group-hover:border-indigo-300 transition-colors">
      <span className="text-base font-medium text-slate-700 truncate pr-4">{value || 'N/A'}</span>
      {copyable && value && (
        <button onClick={onCopy} className="text-slate-300 hover:text-indigo-500 transition-colors" title="Copiar">
          {isCopied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      )}
    </div>
  </div>
);