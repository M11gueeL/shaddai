import { useEffect, useState } from 'react';
import PatientsApi from '../../../api/PatientsApi';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import PatientReportModal from './PatientReportModal';
import { 
  FileText, User, CreditCard, Calendar, Users, Heart, 
  Phone, MapPin, Mail, Edit2, Trash2, Save, X, Clock, Activity
} from 'lucide-react';

export default function PatientDetail({ patient, onClose, onPatientUpdated, initialEditing = false }) {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [formData, setFormData] = useState(patient);
  const [loading, setLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    setIsEditing(initialEditing);
  }, [initialEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await PatientsApi.update(patient.id, formData, token);
      toast.success('Paciente actualizado con éxito');
      setIsEditing(false);
      onPatientUpdated();
    } catch (error) {
      const errMsg = 'Error al actualizar el paciente: ' + (error.response?.data?.message || error.message);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: 'Eliminar Paciente',
      message: `¿Estás seguro de que deseas eliminar a ${patient.full_name}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      tone: 'danger'
    });

    if (isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await PatientsApi.delete(patient.id, token);
        toast.success('Paciente eliminado correctamente');
        onPatientUpdated(); // Refresh list
        onClose(); // Close modal
      } catch (error) {
        toast.error('Error al eliminar el paciente: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto flex flex-col h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b border-gray-100 text-white transition-colors duration-300 ${isEditing ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
        <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl shadow-inner">
                {isEditing ? <Edit2 className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
            </div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {isEditing ? 'Modificar Datos' : patient.full_name}
                </h2>
                <p className="text-blue-50 opacity-90 text-sm font-medium">
                  {isEditing ? 'Edite la información del paciente' : `Cédula: ${patient.cedula}`}
                </p>
            </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section: Personal Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Full Name */}
                    <div className="group">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Cedula */}
                    <div className="group">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Cédula</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="cedula"
                                value={formData.cedula}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Birth Date */}
                    <div className="group">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Fecha de Nacimiento</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="group">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Género</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800 appearance-none"
                            >
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                            </select>
                        </div>
                    </div>

                    {/* Marital Status */}
                    <div className="group">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Estado Civil</label>
                        <div className="relative">
                            <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                name="marital_status"
                                value={formData.marital_status}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800 appearance-none"
                            >
                                <option value="Soltero">Soltero</option>
                                <option value="Casado">Casado</option>
                                <option value="Divorciado">Divorciado</option>
                                <option value="Viudo">Viudo</option>
                                <option value="Unión Libre">Unión Libre</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Contact Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Phone className="w-4 h-4 text-blue-500" />
                    Información de Contacto
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div className="group">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Teléfono</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="group">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2 group">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Dirección</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                                rows="2"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Metadata (Read Only) */}
            {!isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500 bg-gray-100/50 p-4 rounded-xl border border-gray-200/50">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Registrado el: <span className="font-medium text-gray-700">{formatDate(formData.created_at)}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Última actualización: <span className="font-medium text-gray-700">{formatDate(formData.updated_at)}</span></span>
                    </div>
                </div>
            )}
        </form>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
        {isEditing ? (
            <>
                <button
                    type="button"
                    onClick={() => {
                        setIsEditing(false);
                        setFormData(patient);
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Guardar Cambios
                </button>
            </>
        ) : (
            <>
                <button
                    onClick={handleDelete}
                    className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                </button>
                
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium flex items-center gap-2 transition-all shadow-sm"
                    >
                        <FileText className="w-4 h-4 text-blue-500" />
                        Historial
                    </button>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                        <Edit2 className="w-4 h-4" />
                        Modificar
                    </button>
                </div>
            </>
        )}
      </div>
      
      <PatientReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        patientId={patient.id}
        patientName={patient.full_name}
      />
    </div>
  );
}