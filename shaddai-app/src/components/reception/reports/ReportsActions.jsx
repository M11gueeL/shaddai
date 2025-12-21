import { useState } from 'react';
import { FileText, Filter } from 'lucide-react';
import ReportsHubModal from './ReportsHubModal';

const cardBase = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";

export default function ReportsActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`${cardBase} h-full flex flex-col hover:shadow-md transition-shadow duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Nuevo</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">Centro de Reportes</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Genera listados detallados de citas, reportes por médico y estadísticas por especialidad. Exporta a Excel, PDF o CSV.
        </p>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-auto w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group"
        >
          <Filter className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Abrir Centro de Reportes
        </button>
      </div>

      <ReportsHubModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}