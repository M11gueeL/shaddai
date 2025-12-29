import { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  X, 
  Calendar, 
  ChevronDown, 
  ClipboardList, 
  CheckCheck, 
  AlertTriangle, 
  ShoppingCart, 
  AlertOctagon, 
  PieChart, 
  Archive, 
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateInventoryReport, listInventory } from '../../api/inventoryApi';
import { useAuth } from '../../context/AuthContext';

const reportTypes = [
  { 
    id: 'expiration_risk', 
    title: 'Semáforo de Vencimientos', 
    description: 'Proyección de riesgo y prevención de pérdidas por vencimiento.', 
    icon: AlertTriangle, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50' 
  },
  { 
    id: 'movement_kardex', 
    title: 'Kardex de Movimientos', 
    description: 'Auditoría forense y trazabilidad completa de movimientos.', 
    icon: ClipboardList, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50' 
  },
  { 
    id: 'purchase_suggestion', 
    title: 'Sugerido de Compras', 
    description: 'Lista de reabastecimiento basada en puntos de reorden.', 
    icon: ShoppingCart, 
    color: 'text-green-600', 
    bg: 'bg-green-50' 
  },
  { 
    id: 'leaks_adjustments', 
    title: 'Fugas y Ajustes Manuales', 
    description: 'Control de pérdidas, ajustes manuales y auditoría de seguridad.', 
    icon: AlertOctagon, 
    color: 'text-red-600', 
    bg: 'bg-red-50' 
  },
  { 
    id: 'consumption_analysis', 
    title: 'Consumo: Facturado vs. Uso Interno', 
    description: 'Análisis de rentabilidad: Facturado vs. Gasto Operativo.', 
    icon: PieChart, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50' 
  },
  { 
    id: 'dead_stock', 
    title: 'Stock Inmovilizado', 
    description: 'Identificación de capital inmovilizado sin rotación reciente.', 
    icon: Archive, 
    color: 'text-gray-600', 
    bg: 'bg-gray-100' 
  },
  { 
    id: 'inventory_valuation', 
    title: 'Valoración de Inventario', 
    description: 'Valoración financiera exacta detallada por lotes activos.', 
    icon: DollarSign, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50' 
  },
];

export default function InventoryReportsModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const [selectedReport, setSelectedReport] = useState(reportTypes[0].id);
  const [isReportListOpen, setIsReportListOpen] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState(null);
  const [items, setItems] = useState([]);
  
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split('T')[0], 
    end_date: new Date().toISOString().split('T')[0],
    item_id: ''   
  });

  useEffect(() => {
    if (isOpen) {
        listInventory({ all: 1 }, token)
            .then(res => setItems(res.data))
            .catch(err => console.error("Error loading items", err));
    }
  }, [isOpen, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = async (format) => {
    try {
      setLoadingFormat(format);
      const params = {
        type: selectedReport,
        format,
        ...filters
      };

      const response = await generateInventoryReport(params, token);
      
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const ext = format === 'excel' ? 'xlsx' : format;
      const reportName = reportTypes.find(r => r.id === selectedReport)?.title || 'reporte';
      const safeName = reportName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      link.setAttribute('download', `${safeName}_${filters.start_date}.${ext}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Reporte generado correctamente`);// const response = await inventoryApi.generateReport({ ...filters, type: selectedReport, format }, token);
      
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoadingFormat(null);
    }
  };

  if (!isOpen) return null;

  const currentReport = reportTypes.find(r => r.id === selectedReport);
  const CurrentIcon = currentReport?.icon || ClipboardList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        
        {/* Header del Modal */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl flex-shrink-0">
          <div className="text-white">
            <h3 className="font-bold text-lg">Reportes de Inventario</h3>
            <p className="text-blue-100 text-xs opacity-90">Generación de reportes y análisis</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 bg-gray-50/50 overflow-y-auto">
          
          {/* Selección de Reporte */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Tipo de Reporte</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsReportListOpen(!isReportListOpen)}
                className="w-full flex items-center justify-between text-left border border-gray-200 bg-gray-50 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:bg-gray-100"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-1.5 rounded-md flex-shrink-0 ${currentReport?.bg}`}>
                    <CurrentIcon className={`w-5 h-5 ${currentReport?.color}`} />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-gray-800 font-bold text-sm truncate">{currentReport?.title}</span>
                    <span className="text-gray-500 text-xs truncate">{currentReport?.description}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isReportListOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isReportListOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  <div className="p-1 space-y-0.5">
                    {reportTypes.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setSelectedReport(option.id);
                          setIsReportListOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left ${selectedReport === option.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`p-1.5 rounded-md flex-shrink-0 ${option.bg}`}>
                          <option.icon className={`w-4 h-4 ${option.color}`} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className={`font-medium truncate ${selectedReport === option.id ? 'text-blue-700' : 'text-gray-700'}`}>{option.title}</span>
                          <span className="text-xs text-gray-500 truncate">{option.description}</span>
                        </div>
                        {selectedReport === option.id && <CheckCheck className="w-4 h-4 ml-auto text-blue-600 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filtros de Fecha */}
          {selectedReport !== 'expiration_risk' && selectedReport !== 'purchase_suggestion' && selectedReport !== 'inventory_valuation' && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1.5">
                    <Calendar className="w-3 h-3 text-blue-500" /> {selectedReport === 'dead_stock' ? 'Sin movimiento desde' : 'Fecha Inicio'}
                  </label>
                  <input 
                    type="date" 
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleInputChange}
                    className="w-full text-sm border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                {selectedReport !== 'dead_stock' && (
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
                )}
              </div>

              {/* Filtro de Insumo (Solo para Kardex) */}
              {selectedReport === 'movement_kardex' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Filtrar por Insumo (Opcional)</label>
                    <div className="relative">
                        <select
                            name="item_id"
                            value={filters.item_id}
                            onChange={handleInputChange}
                            className="w-full text-sm border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none py-2 pl-3 pr-8"
                        >
                            <option value="">Todos los insumos</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.code} - {item.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
              )}
            </div>
          )}

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
                    <span className="block text-xs text-gray-500">Para análisis de datos y contabilidad</span>
                  </div>
                </div>
                {loadingFormat === 'excel' ? <span className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"/> : <Download className="w-5 h-5 text-gray-300 group-hover:text-emerald-500" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
