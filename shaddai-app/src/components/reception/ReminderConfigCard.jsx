import { Bell, Settings } from 'lucide-react';

export default function ReminderConfigCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col hover:border-amber-300 hover:shadow-md transition-all duration-300 group cursor-default">
      
      <div className="flex items-start justify-between mb-6">
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-300">
          <Bell className="w-8 h-8 text-amber-600" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-700 transition-colors">Configuración de Recordatorios</h3>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed flex-1">
        Gestiona las alertas automáticas y recordatorios para pacientes y médicos.
      </p>

      <button 
        className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 active:scale-95 group/btn opacity-60 cursor-not-allowed"
        disabled
      >
        <Settings className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-500" />
        Próximamente
      </button>
    </div>
  );
}
