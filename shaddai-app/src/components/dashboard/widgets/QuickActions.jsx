import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Ajusta ruta
import { User, Users, Stethoscope, Wallet, Package, Shield, ArrowRight, Activity } from "lucide-react";

export default function QuickActions() {
  const { hasRole } = useAuth();

  const shortcuts = [
    { role: ["admin", "recepcionista"], to: "/reception", title: "Recepción", desc: "Gestión de pacientes", icon: Users, color: "bg-blue-600", gradient: "from-blue-600 to-cyan-500" },
    { role: ["admin", "medico"], to: "/medicalrecords", title: "Hist. Clínicas", desc: "Expedientes médicos", icon: Stethoscope, color: "bg-emerald-600", gradient: "from-emerald-600 to-teal-500" },
    { role: ["admin", "recepcionista"], to: "/payment", title: "Caja y Pagos", desc: "Control financiero", icon: Wallet, color: "bg-indigo-600", gradient: "from-indigo-600 to-violet-600" },
    { role: ["admin", "recepcionista"], to: "/inventory", title: "Inventario", desc: "Stock de insumos", icon: Package, color: "bg-orange-500", gradient: "from-orange-500 to-amber-500" },
    { role: ["admin"], to: "/controlpanel", title: "Panel Control", desc: "Sistema y usuarios", icon: Shield, color: "bg-slate-700", gradient: "from-slate-700 to-slate-900" },
  ];

  const activeShortcuts = shortcuts.filter(s => hasRole(s.role));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          <Activity className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Accesos Rápidos</h3>
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
          <Link key={idx} to={item.to} className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
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
  );
}