import { useState } from 'react';
import { FileText, Filter, BarChart3, ArrowRight, PieChart, PanelBottomOpen } from 'lucide-react';
import ReportsHubModal from './ReportsHubModal';

export default function ReportsActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col hover:border-blue-300 hover:shadow-md transition-all duration-300 group cursor-default">
        
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
            <PieChart className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">Centro de Reportes</h3>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed flex-1">
          Herramienta para la generación de reportes, análisis de citas y exportación de datos.
        </p>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 active:scale-95 group/btn"
        >
          <PanelBottomOpen className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
          Abrir Panel
        </button>
      </div>

      <ReportsHubModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}