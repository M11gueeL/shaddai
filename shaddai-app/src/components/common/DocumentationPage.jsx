import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ElegantHeader from './ElegantHeader';
import { BookOpen, Stethoscope, UserCog, ShieldCheck, Download, FileText, Info } from 'lucide-react';

// Custom component to notify about upcoming manuals
const ComingSoonNotification = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span className="sr-only">Cerrar</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info size={32} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Próximamente</h3>
          <p className="text-slate-600 mb-6">
            Estamos finalizando los detalles de este manual para brindarte la mejor guía posible. Estará disponible muy pronto.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-200"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DocumentationPage() {
  const { hasRole } = useAuth();
  const toast = useToast();
  const [showNotification, setShowNotification] = React.useState(false);

  const handleDownloadClick = (manualTitle) => {
    // Show custom notification component
    setShowNotification(true);
  };

  // Helper function to render a manual card
  const ManualCard = ({ title, description, icon: Icon, colorClass, buttonColorClass, gradientColor }) => (
    <div className="group relative bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center overflow-hidden">
      
      <div className={`p-5 rounded-2xl ${colorClass} mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
        <Icon size={36} className="text-white" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-3 relative z-10">{title}</h3>
      <p className="text-slate-500 text-sm mb-8 flex-grow leading-relaxed relative z-10">{description}</p>
      
      <button 
        onClick={() => handleDownloadClick(title)}
        className={`w-full py-3 px-4 ${buttonColorClass || 'bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600'} rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 group-hover:ring-1 ring-inset ring-black/5 relative z-10`}
      >
        <Download size={18} />
        <span>Descargar PDF</span>
      </button>
      
      {/* Decorative gradient border on bottom */}
      <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent ${gradientColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ElegantHeader
          icon={BookOpen}
          sectionName="Recursos"
          title="Centro de"
          highlightText="Documentación"
          description="Accede a los manuales y guías de uso del sistema diseñados específicamente para tu rol. Descarga la información que necesitas para aprovechar al máximo todas las funcionalidades."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {/* Manual de Administrador */}
          {hasRole(['admin']) && (
            <ManualCard 
              title="Manual de Administrador" 
              description="Guía completa sobre configuración del sistema, gestión de usuarios, auditorías y reportes avanzados."
              icon={ShieldCheck}
              colorClass="bg-purple-600 text-purple-600"
              buttonColorClass="bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800"
              gradientColor="via-purple-600"
            />
          )}

          {/* Manual de Médico */}
          {hasRole(['medico']) && (
            <ManualCard 
              title="Manual de Médico"
              description="Documentación sobre gestión de historias clínicas, recetas, diagnósticos y seguimiento de pacientes."
              icon={Stethoscope}
              colorClass="bg-blue-500 text-blue-500"
              buttonColorClass="bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800"
              gradientColor="via-blue-500"
            />
          )}

          {/* Manual de Recepcionista */}
          {hasRole(['recepcionista']) && (
            <ManualCard 
              title="Manual de Recepcionista"
              description="Instrucciones para gestión de citas, admisión de pacientes, cobros y manejo de caja."
              icon={UserCog}
              colorClass="bg-emerald-500 text-emerald-500"
              buttonColorClass="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800"
              gradientColor="via-emerald-500"
            />
          )}
        </div>
        
        {/* Fallback if no roles match */}
        {!hasRole(['admin', 'medico', 'recepcionista']) && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100 border-dashed mt-8">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">Sin documentación disponible</h3>
            <p className="text-slate-500 max-w-md mx-auto">No hay manuales asignados a tu rol actual. Contacta al administrador si crees que esto es un error.</p>
          </div>
        )}
      </div>

      <ComingSoonNotification 
        isOpen={showNotification} 
        onClose={() => setShowNotification(false)} 
      />
    </div>
  );
}
