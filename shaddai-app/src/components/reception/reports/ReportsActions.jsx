import { useState } from 'react';
import { Download, FileText, X, Calendar, Filter, FileSpreadsheet, ChevronDown, ClipboardList, CheckCircle, Clock, CheckCheck, XCircle, UserX } from 'lucide-react';
import appointmentsApi from '../../../api/appointments';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const cardBase = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";

const statusOptions = [
  { value: 'todos', label: 'Todas las citas', icon: ClipboardList, color: 'text-gray-600', bg: 'bg-gray-100' },
  { value: 'programada', label: 'Programadas', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'confirmada', label: 'Confirmadas', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'en_progreso', label: 'En Progreso', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'completada', label: 'Completadas', icon: CheckCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { value: 'cancelada', label: 'Canceladas', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  { value: 'no_se_presento', label: 'No se presentó', icon: UserX, color: 'text-gray-500', bg: 'bg-gray-100' },
];

export default function ReportsActions() {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState(null);
  
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split('T')[0], 
    end_date: new Date().toISOString().split('T')[0],   
    status: 'todos'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = async (format) => {
    try {
      setLoadingFormat(format);
      // Incluimos el formato en la petición (csv, excel, pdf)
      const filtersWithFormat = { ...filters, format };
      
      const response = await appointmentsApi.exportReport(filtersWithFormat, token);
      
      // Manejar la descarga según el tipo de archivo
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extensión correcta
      const ext = format === 'excel' ? 'xlsx' : format;
      link.setAttribute('download', `reporte_citas_${filters.status}_${filters.start_date}.${ext}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Reporte ${format.toUpperCase()} generado correctamente`);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoadingFormat(null);
    }
  };

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
          Genera listados detallados de citas con formato profesional. Exporta a Excel, PDF o CSV según tus necesidades.
        </p>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-auto w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group"
        >
          <Filter className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Configurar Exportación
        </button>
      </div>

      {/* Modal de Configuración Mejorado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
            
            {/* Header del Modal */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
              <div className="text-white">
                <h3 className="font-bold text-lg">Exportar Reporte de Citas</h3>
                <p className="text-blue-100 text-xs opacity-90">Selecciona el rango y el formato deseado</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 bg-gray-50/50">
              {/* Filtros */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1.5">
                      <Calendar className="w-3 h-3 text-blue-500" /> Fecha Inicio
                    </label>
                    <input 
                      type="date" 
                      name="start_date"
                      value={filters.start_date}
                      onChange={handleInputChange}
                      className="w-full text-sm border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1.5">
                      <Calendar className="w-3 h-3 text-blue-500" /> Fecha Fin
                    </label>
                    <input 
                      type="date" 
                      name="end_date"
                      value={filters.end_date}
                      onChange={handleInputChange}
                      className="w-full text-sm border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Filtrar por Estado</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                      className="w-full flex items-center justify-between text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        {(() => {
                          const selected = statusOptions.find(opt => opt.value === filters.status);
                          const Icon = selected?.icon || ClipboardList;
                          return (
                            <>
                              <Icon className={`w-4 h-4 ${selected?.color}`} />
                              <span className="text-gray-700 font-medium">{selected?.label}</span>
                            </>
                          );
                        })()}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isStatusOpen && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        <div className="p-1 space-y-0.5">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setFilters(prev => ({ ...prev, status: option.value }));
                                setIsStatusOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${filters.status === option.value ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                              <div className={`p-1.5 rounded-md ${option.bg}`}>
                                <option.icon className={`w-4 h-4 ${option.color}`} />
                              </div>
                              <span className="font-medium">{option.label}</span>
                              {filters.status === option.value && <CheckCheck className="w-4 h-4 ml-auto text-blue-600" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Formato de descarga</p>
                
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={!!loadingFormat}
                    className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold text-gray-800 group-hover:text-red-700">Documento PDF</span>
                        <span className="block text-xs text-gray-500">Ideal para imprimir y reportes oficiales</span>
                      </div>
                    </div>
                    {loadingFormat === 'pdf' ? <span className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"/> : <Download className="w-5 h-5 text-gray-300 group-hover:text-red-500" />}
                  </button>

                  <button
                    onClick={() => handleExport('excel')}
                    disabled={!!loadingFormat}
                    className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 rounded-xl transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-200 transition-colors">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold text-gray-800 group-hover:text-emerald-700">Excel (.xlsx)</span>
                        <span className="block text-xs text-gray-500">Con formato, filtros y encabezados</span>
                      </div>
                    </div>
                    {loadingFormat === 'excel' ? <span className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"/> : <Download className="w-5 h-5 text-gray-300 group-hover:text-emerald-500" />}
                  </button>

                  <button
                    onClick={() => handleExport('csv')}
                    disabled={!!loadingFormat}
                    className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all group shadow-sm"
                  >
                     <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200 transition-colors">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold text-gray-800">Archivo CSV</span>
                        <span className="block text-xs text-gray-500">Datos crudos para análisis rápido</span>
                      </div>
                    </div>
                    {loadingFormat === 'csv' ? <span className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"/> : <Download className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}