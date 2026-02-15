import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ElegantHeader from './ElegantHeader';
import { BookOpen, Stethoscope, UserCog, ShieldCheck, Download, FileText } from 'lucide-react';

export default function DocumentationPage() {
  const { hasRole } = useAuth();

  // Helper function to render a manual card
  const ManualCard = ({ title, description, icon: Icon, colorClass }) => (
    <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col items-center text-center">
      <div className={`p-4 rounded-xl ${colorClass} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={32} className={colorClass.replace('bg-', 'text-')} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 flex-grow">{description}</p>
      
      <button 
        onClick={() => alert("El manual estará disponible pronto.")}
        className="w-full py-2.5 px-4 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 group-hover:ring-1 group-hover:ring-indigo-200"
      >
        <Download size={16} />
        <span>Descargar PDF</span>
      </button>
      
      {/* Decorative gradient border on bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ElegantHeader
        icon={BookOpen}
        sectionName="Recursos"
        title="Centro de"
        highlightText="Documentación"
        description="Accede a los manuales y guías de uso del sistema diseñados específicamente para tu rol. Descarga la información que necesitas para aprovechar al máximo todas las funcionalidades."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Manual de Administrador */}
        {hasRole(['admin']) && (
          <ManualCard 
            title="Manual de Administrador" 
            description="Guía completa sobre configuración del sistema, gestión de usuarios, auditorías y reportes avanzados."
            icon={ShieldCheck}
            colorClass="bg-purple-600 text-purple-600"
          />
        )}

        {/* Manual de Médico */}
        {hasRole(['medico']) && (
          <ManualCard 
            title="Manual de Médico"
            description="Documentación sobre gestión de historias clínicas, recetas, diagnósticos y seguimiento de pacientes."
            icon={Stethoscope}
            colorClass="bg-blue-500 text-blue-500"
          />
        )}

        {/* Manual de Recepcionista */}
        {hasRole(['recepcionista']) && (
          <ManualCard 
            title="Manual de Recepcionista"
            description="Instrucciones para gestión de citas, admisión de pacientes, cobros y manejo de caja."
            icon={UserCog}
            colorClass="bg-emerald-500 text-emerald-500"
          />
        )}
      </div>
      
      {/* Fallback if no roles match (shouldn't happen in protected route but good for safety) */}
      {!hasRole(['admin', 'medico', 'recepcionista']) && (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-500">No hay manuales disponibles para tu rol actual.</h3>
        </div>
      )}
    </div>
  );
}
