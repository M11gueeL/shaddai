import { useState, useEffect } from 'react';
import { Download, FileText, X, Calendar, ChevronDown, ClipboardList, CheckCircle, Clock, CheckCheck, XCircle, UserX, Stethoscope, Activity, Users, TrendingUp } from 'lucide-react';
import appointmentsApi from '../../../api/appointments';
import userApi from '../../../api/userApi';
import PatientsApi from '../../../api/PatientsApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'todos', label: 'Todas las citas', icon: ClipboardList, color: 'text-gray-600', bg: 'bg-gray-100' },
  { value: 'programada', label: 'Programadas', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'confirmada', label: 'Confirmadas', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'en_progreso', label: 'En Progreso', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'completada', label: 'Completadas', icon: CheckCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { value: 'cancelada', label: 'Canceladas', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  { value: 'no_se_presento', label: 'No se presentó', icon: UserX, color: 'text-gray-500', bg: 'bg-gray-100' },
];

export default function ReportsHubModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState(null);
  
  // Data for selectors
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [patients, setPatients] = useState([]);

  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split('T')[0], 
    end_date: new Date().toISOString().split('T')[0],   
    status: 'todos',
    doctor_id: '',
    specialty_id: '',
    patient_id: ''
  });

  const [advancedStats, setAdvancedStats] = useState(null);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [advancedType, setAdvancedType] = useState('specialty');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [docsRes, specsRes, patsRes] = await Promise.all([
        userApi.getDoctors(token),
        userApi.getSpecialties(token),
        PatientsApi.getAll(token)
      ]);
      setDoctors(docsRes.data || []);
      setSpecialties(specsRes.data || []);
      setPatients(patsRes.data || []);
    } catch (error) {
      console.error("Error loading report data", error);
    }
  };

  const loadAdvancedStats = async () => {
    setAdvancedLoading(true);
    try {
        const params = {
            start_date: filters.start_date,
            end_date: filters.end_date,
            type: advancedType
        };
        const res = await appointmentsApi.getAdvancedStats(params, token);
        setAdvancedStats(res.data);
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.error || 'Error al cargar indicadores');
    } finally {
        setAdvancedLoading(false);
    }
  };

  const handleExportPerformance = async () => {
    setAdvancedLoading(true);
    try {
        const params = {
            start_date: filters.start_date,
            end_date: filters.end_date,
            type: advancedType
        };
        
        const response = await appointmentsApi.exportPerformanceReport(params, token);
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte_rendimiento_${advancedType}_${filters.start_date}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast.success('Reporte PDF generado correctamente');
    } catch (error) {
        console.error(error);
        toast.error('Error al generar el reporte PDF');
    } finally {
        setAdvancedLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = async (format) => {
    try {
      setLoadingFormat(format);
      const filtersWithFormat = { ...filters, format };
      
      let response;
      let filenamePrefix = 'reporte_citas';

      if (activeTab === 'general') {
        response = await appointmentsApi.exportReport(filtersWithFormat, token);
      } else if (activeTab === 'doctor') {
        if (!filters.doctor_id) {
            toast.error('Seleccione un médico');
            setLoadingFormat(null);
            return;
        }
        response = await appointmentsApi.exportDoctorReport(filtersWithFormat, token);
        filenamePrefix += '_medico';
      } else if (activeTab === 'specialty') {
        if (!filters.specialty_id) {
            toast.error('Seleccione una especialidad');
            setLoadingFormat(null);
            return;
        }
        response = await appointmentsApi.exportSpecialtyReport(filtersWithFormat, token);
        filenamePrefix += '_especialidad';
      } else if (activeTab === 'patient') {
        if (!filters.patient_id) {
            toast.error('Seleccione un paciente');
            setLoadingFormat(null);
            return;
        }
        response = await appointmentsApi.exportPatientReport(filtersWithFormat, token);
        filenamePrefix += '_paciente';
      }
      
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const ext = format === 'excel' ? 'xlsx' : format;
      link.setAttribute('download', `${filenamePrefix}_${filters.start_date}.${ext}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Reporte ${format.toUpperCase()} generado correctamente`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoadingFormat(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl shrink-0">
          <div className="text-white">
            <h3 className="font-bold text-lg">Centro de Reportes</h3>
            <p className="text-blue-100 text-xs opacity-90">Generación avanzada de reportes y estadísticas</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-100 p-4 space-y-2 overflow-y-auto">
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'general' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <div className={`p-2 rounded-lg ${activeTab === 'general' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                        <ClipboardList className="w-4 h-4" />
                    </div>
                    Por Citas
                </button>
                <button 
                    onClick={() => setActiveTab('doctor')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'doctor' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <div className={`p-2 rounded-lg ${activeTab === 'doctor' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                        <Stethoscope className="w-4 h-4" />
                    </div>
                    Por Médico
                </button>
                <button 
                    onClick={() => setActiveTab('specialty')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'specialty' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <div className={`p-2 rounded-lg ${activeTab === 'specialty' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                        <Activity className="w-4 h-4" />
                    </div>
                    Por Especialidad
                </button>
                <button 
                    onClick={() => setActiveTab('patient')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'patient' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <div className={`p-2 rounded-lg ${activeTab === 'patient' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                        <Users className="w-4 h-4" />
                    </div>
                    Por Paciente
                </button>
                <button 
                    onClick={() => setActiveTab('advanced')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'advanced' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <div className={`p-2 rounded-lg ${activeTab === 'advanced' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    Indicadores de Rendimiento
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-white">
                <div className="space-y-6">
                    
                    {/* Dynamic Title & Desc */}
                    <div>
                        <h4 className="text-lg font-bold text-gray-800">
                            {activeTab === 'general' && 'Reporte General de Citas'}
                            {activeTab === 'doctor' && 'Reporte por Médico'}
                            {activeTab === 'specialty' && 'Reporte por Especialidad'}
                            {activeTab === 'patient' && 'Reporte por Paciente'}
                            {activeTab === 'advanced' && 'Indicadores de Rendimiento'}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                            {activeTab === 'general' && 'Exporta un listado completo de todas las citas en el sistema.'}
                            {activeTab === 'doctor' && 'Analiza el rendimiento y citas asignadas a un médico específico.'}
                            {activeTab === 'specialty' && 'Estadísticas y listados detallados por área médica.'}
                            {activeTab === 'patient' && 'Historial completo de citas de un paciente específico.'}
                            {activeTab === 'advanced' && 'Análisis detallado de métricas y productividad por dimensión.'}
                        </p>
                    </div>

                    {/* Specific Filters */}
                    {activeTab === 'doctor' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Seleccionar Médico</label>
                            <select 
                                name="doctor_id" 
                                value={filters.doctor_id} 
                                onChange={handleInputChange}
                                className="w-full text-sm border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5"
                            >
                                <option value="">-- Seleccione un médico --</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {activeTab === 'specialty' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Seleccionar Especialidad</label>
                            <select 
                                name="specialty_id" 
                                value={filters.specialty_id} 
                                onChange={handleInputChange}
                                className="w-full text-sm border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5"
                            >
                                <option value="">-- Seleccione una especialidad --</option>
                                {specialties.map(spec => (
                                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {activeTab === 'patient' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Seleccionar Paciente</label>
                            <select 
                                name="patient_id" 
                                value={filters.patient_id} 
                                onChange={handleInputChange}
                                className="w-full text-sm border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5"
                            >
                                <option value="">-- Seleccione un paciente --</option>
                                {patients.map((pat) => (
                                    <option key={pat.id} value={pat.id}>
                                        {pat.full_name} - {pat.cedula}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Dimensión de Análisis</label>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setAdvancedType('specialty')}
                                        className={`flex-1 py-2 text-sm rounded-lg border ${advancedType === 'specialty' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        Especialidad
                                    </button>
                                    <button
                                        onClick={() => setAdvancedType('doctor')}
                                        className={`flex-1 py-2 text-sm rounded-lg border ${advancedType === 'doctor' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        Médico
                                    </button>
                                    <button
                                        onClick={() => setAdvancedType('patient')}
                                        className={`flex-1 py-2 text-sm rounded-lg border ${advancedType === 'patient' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        Paciente
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Common Filters */}
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

                    {activeTab !== 'advanced' && (
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
                    )}

                    {activeTab === 'advanced' && (
                        <div className="space-y-4">
                            <button
                                onClick={handleExportPerformance}
                                disabled={advancedLoading}
                                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                                {advancedLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : <FileText className="w-5 h-5" />}
                                Generar Reporte PDF
                            </button>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                                <p className="flex items-start gap-2">
                                    <TrendingUp className="w-5 h-5 shrink-0" />
                                    <span>
                                        Este reporte generará un documento PDF detallado con métricas de rendimiento, tasas de éxito y cancelación para la dimensión seleccionada ({advancedType === 'specialty' ? 'Especialidad' : (advancedType === 'doctor' ? 'Médico' : 'Paciente')}) en el rango de fechas especificado.
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {activeTab !== 'advanced' && (
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Descargar como</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleExport('pdf')}
                                disabled={!!loadingFormat}
                                className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all group shadow-sm hover:shadow-md text-center"
                            >
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200 transition-colors mb-2">
                                    {loadingFormat === 'pdf' ? <span className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full block"/> : <FileText className="w-5 h-5" />}
                                </div>
                                <span className="text-xs font-bold text-gray-700 group-hover:text-red-700">PDF</span>
                            </button>

                            <button
                                onClick={() => handleExport('excel')}
                                disabled={!!loadingFormat}
                                className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 rounded-xl transition-all group shadow-sm hover:shadow-md text-center"
                            >
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-200 transition-colors mb-2">
                                    {loadingFormat === 'excel' ? <span className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full block"/> : <FileText className="w-5 h-5" />}
                                </div>
                                <span className="text-xs font-bold text-gray-700 group-hover:text-emerald-700">Excel</span>
                            </button>

                            <button
                                onClick={() => handleExport('csv')}
                                disabled={!!loadingFormat}
                                className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all group shadow-sm hover:shadow-md text-center"
                            >
                                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200 transition-colors mb-2">
                                    {loadingFormat === 'csv' ? <span className="animate-spin h-5 w-5 border-2 border-gray-600 border-t-transparent rounded-full block"/> : <FileText className="w-5 h-5" />}
                                </div>
                                <span className="text-xs font-bold text-gray-700 group-hover:text-gray-700">CSV</span>
                            </button>
                        </div>
                    </div>
                    )}

                </div>
            </div>
        </div>
      </div>
    </div>
  );
}