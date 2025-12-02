import React from "react";
import { Heart, ShieldCheck } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] border-t border-slate-800 pt-12 pb-6 relative overflow-hidden">
      {/* Efecto de luz de fondo (Glow sutil) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent blur-sm"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
          
          {/* Columna 1: Marca y Misión (Ocupa 5 columnas para dar aire) */}
          <div className="md:col-span-5 lg:col-span-5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 rounded-full"></div>
                {/* Logo más grande */}
                <img 
                    src="/shaddai_logo.png" 
                    alt="Logo Shaddai" 
                    className="h-20 w-20 object-contain relative z-10"
                    onError={(e) => { e.target.style.display = 'none'; }} 
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Shaddai Rafa</h3>
                <p className="text-xs text-indigo-400 font-medium tracking-wider uppercase">Sistema Médico Shaddai</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Optimizando la gestión de salud con tecnología de vanguardia. 
              Seguridad, eficiencia y control total para Centro de Especialidades Médicas Shaddai Rafa.
            </p>
          </div>

          {/* Columna 2: Enlaces - Plataforma */}
          <div className="md:col-span-3 lg:col-span-3 md:col-start-7">
            <h4 className="text-white font-semibold mb-4 text-sm">Plataforma</h4>
            <ul className="space-y-3">
              <FooterLink text="Documentación" />
            </ul>
          </div>

          {/* Columna 3: Enlaces - Legal & Soporte */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-3">
              <FooterLink text="Política de Privacidad" />
              <FooterLink text="Términos de Servicio" />
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-slate-800/50 my-8"></div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="text-slate-500 flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <span>&copy; {currentYear} Centro de Especialidades Médicas Shaddai Rafa. Todos los derechos reservados</span>
            <span className="hidden md:inline text-slate-700">•</span>
            <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors cursor-default">
              Hecho con <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" /> en Venezuela
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded border border-slate-800">
              v1.2.0-beta
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Subcomponente para Enlaces con efecto Hover elegante
const FooterLink = ({ text, badge }) => (
  <li>
    <a href="#" className="group flex items-center gap-2 text-slate-400 hover:text-indigo-300 transition-colors text-sm w-fit">
      <span className="relative">
        {text}
        <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-400 transition-all group-hover:w-full"></span>
      </span>
      {badge && (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {badge}
        </span>
      )}
    </a>
  </li>
);

export default Footer;