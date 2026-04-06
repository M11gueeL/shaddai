import { useEffect, useState } from 'react';
import PatientsApi from '../../../api/PatientsApi';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import PatientReportModal from './PatientReportModal';
import PatientSearch from '../appointments/PatientSearch';
import { 
  FileText, User, CreditCard, Calendar, Users, Heart, 
  Phone, MapPin, Mail, Edit2, Trash2, Save, X, Clock, Activity
} from 'lucide-react';

export default function PatientDetail({ patient, onClose, onPatientUpdated, initialEditing = false }) {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [isEditing, setIsEditing] = useState(initialEditing);
  
  const hasCedula = patient.cedula !== null && patient.cedula !== '' && patient.cedula !== '-';
  const initiallyIsMinor = !hasCedula || Boolean(patient.representative_id);
  const [isMinorOrUndocumented, setIsMinorOrUndocumented] = useState(initiallyIsMinor);
  
  const [selectedRepresentative, setSelectedRepresentative] = useState(() => {
    if (patient.representative_id && patient.representative_name) {
      return { 
        id: patient.representative_id, 
        full_name: patient.representative_name,
        cedula: patient.representative_cedula || ''
      };
    }
    return null;
  });

  const [formData, setFormData] = useState(() => {
    let cedulaType = 'V';
    let cedulaNumber = '';
    
    if (patient.cedula) {
        if (patient.cedula.includes('-')) {
            const parts = patient.cedula.split('-');
            cedulaType = parts[0];
            cedulaNumber = parts[1];
        } else {
            // Try to guess or just put everything in number if no separator
            // Assuming legacy data might be just numbers
            cedulaNumber = patient.cedula;
        }
    }

    const phone = patient.phone || '';
    // Simple heuristic for phone code: first 4 digits
    const phoneCode = phone.length >= 4 ? phone.substring(0, 4) : '0412';
    const phoneNumber = phone.length > 4 ? phone.substring(4) : '';

    return {
      ...patient, // Preserve all original fields (id, created_at, etc.)
      full_name: patient.full_name || '',
      birth_date: patient.birth_date || '',
      gender: patient.gender || '',
      marital_status: patient.marital_status || '',
      address: patient.address || '',
      email: patient.email || '',
      cedula_type: cedulaType,
      cedula_number: cedulaNumber,
      phone_code: phoneCode,
      phone_number: phoneNumber,
      representative_relationship: patient.representative_relationship || ''
    };
  });
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

  const [showRepForm, setShowRepForm] = useState(false);
  const [repFormData, setRepFormData] = useState({
    full_name: '',
    cedula_type: 'V',
    cedula_number: '',
    phone_code: '0412',
    phone_number: ''
  });
  const [repLoading, setRepLoading] = useState(false);

    const normalizeSpaces = (value) => String(value || '').trim().replace(/\s+/g, ' ');
    const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

    const validateFullName = (value) => {
        const normalized = normalizeSpaces(value);
        if (normalized.length < 3 || normalized.length > 120) return false;
        return /^[\p{L}][\p{L}\s'\-.]+$/u.test(normalized);
    };

    const validateCedulaDigits = (digits) => {
        if (digits.length < 3 || digits.length > 9) return false;
        if (/^0+$/.test(digits)) return false;
        return true;
    };

    const validatePhoneDigits = (digits) => {
        if (!/^\d{7}$/.test(digits)) return false;
        if (/^0+$/.test(digits)) return false;
        return true;
    };

  const handleRepChange = (e) => {
    const { name, value } = e.target;
    setRepFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRepSubmit = async (e) => {
    e.preventDefault();
    if (!repFormData.full_name || !repFormData.cedula_number || !repFormData.phone_number) {
      toast.error('Complete los datos requeridos del representante.');
      return;
    }
    
    setRepLoading(true);
    try {
      const payload = {
        full_name: repFormData.full_name,
        cedula: `${repFormData.cedula_type}-${repFormData.cedula_number}`,
        phone: `${repFormData.phone_code}${repFormData.phone_number}`,
        representative_id: null,
        representative_relationship: null
      };

      const resp = await PatientsApi.create(payload);
      const newRep = resp.data?.patient;
      
      if (newRep) {
        toast.success(`Representante ${newRep.full_name} creado y asignado.`);
        setSelectedRepresentative(newRep);
        setShowRepForm(false);
      } else {
        toast.error('Representante creado, pero no se pudo recuperar de la BD.');
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message;
      toast.error('Error al registrar representante: ' + errMsg);
    } finally {
      setRepLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

        if (!validateFullName(formData.full_name)) {
            toast.error('Nombre completo inválido (3-120 caracteres, solo letras).');
            return;
        }

    if (isMinorOrUndocumented && (!selectedRepresentative || !formData.representative_relationship)) {
      toast.error('Debe seleccionar un representante y especificar el parentesco.');
      return;
    }

    if (!isMinorOrUndocumented && !formData.cedula_number) {
        toast.error('La cédula es requerida si el paciente posee una.');
        return;
    }

        if (!isMinorOrUndocumented) {
            if (!validateCedulaDigits(onlyDigits(formData.cedula_number))) {
                toast.error('Cédula inválida (3-9 dígitos, no solo ceros).');
                return;
            }
            if (!validatePhoneDigits(onlyDigits(formData.phone_number))) {
                toast.error('Teléfono inválido (7 dígitos, no 0000000).');
                return;
            }
        }

    setLoading(true);
    
    try {
      
      const payload = {
        ...formData,
        cedula: isMinorOrUndocumented ? null : `${formData.cedula_type}-${formData.cedula_number}`,
        phone: isMinorOrUndocumented ? null : (formData.phone_number ? `${formData.phone_code}${formData.phone_number}` : ''),
        email: isMinorOrUndocumented ? null : formData.email,
        representative_id: isMinorOrUndocumented && selectedRepresentative ? selectedRepresentative.id : null,
        representative_relationship: isMinorOrUndocumented ? formData.representative_relationship : null
      };
      delete payload.cedula_type;
      delete payload.cedula_number;
      delete payload.phone_code;
      delete payload.phone_number;

      await PatientsApi.update(patient.id, payload);
      toast.success('Paciente actualizado con éxito');
      setIsEditing(false);
      onPatientUpdated();
    } catch (error) {
      const errMsg = 'Error al actualizar el paciente: ' + (error.response?.data?.error || error.response?.data?.message || error.message);
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
        await PatientsApi.delete(patient.id);
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
    <div className="bg-white h-full w-full flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
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
                  {isEditing ? 'Edite la información del paciente' : `Cédula: ${patient.cedula || 'No posee'}`}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="group">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                            Nombre Completo <span className="text-red-500">*</span>
                        </label>
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
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                            Cédula {!isMinorOrUndocumented && <span className="text-red-500">*</span>}
                        </label>

                        {(isEditing || isMinorOrUndocumented) && (
                            <div className="mb-2">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={isMinorOrUndocumented}
                                        onChange={(e) => setIsMinorOrUndocumented(e.target.checked)}
                                        disabled={!isEditing}
                                        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500/20 border-gray-300 disabled:opacity-50"
                                    />
                                    <span className="ml-2 text-xs text-gray-600 font-medium">
                                        Menor de edad / No posee cédula
                                    </span>
                                </label>
                            </div>
                        )}

                        {!isMinorOrUndocumented ? (
                            <div className="relative flex max-w-sm">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                </div>
                                <select
                                    name="cedula_type"
                                    value={formData.cedula_type}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="pl-10 pr-2 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800 w-20 appearance-none"
                                >
                                    <option value="V">V</option>
                                    <option value="E">E</option>
                                </select>
                                <input
                                    type="text"
                                    name="cedula_number"
                                    value={formData.cedula_number}
                                    onChange={(e) => {
                                        // Allow digits and spaces, max length 12
                                        const val = e.target.value.replace(/[^\d ]/g, '').slice(0, 12);
                                        handleChange({ target: { name: 'cedula_number', value: val } });
                                    }}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Representante Legal <span className="text-red-500">*</span>
                                    </label>
                                    {isEditing ? (
                                        <>
                                        <PatientSearch 
                                            onSelect={(patient) => {
                                                setSelectedRepresentative(patient);
                                                setShowRepForm(false);
                                            }} 
                                            selectedPatient={selectedRepresentative}
                                            onAddNew={(term) => {
                                                // Optional pre-fill
                                                if (term && term.match(/^\d+$/)) {
                                                    setRepFormData(prev => ({ ...prev, cedula_number: term.slice(0,12) }));
                                                } else if (term) {
                                                    setRepFormData(prev => ({ ...prev, full_name: term }));
                                                }
                                                setShowRepForm(true);
                                                setSelectedRepresentative(null);
                                            }}
                                        />
                                        
                                        {showRepForm && (
                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-3 animate-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1"><User className="w-3.5 h-3.5"/> Nuevo Representante</h4>
                                                    <button type="button" onClick={() => setShowRepForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">Nombre *</label>
                                                        <input type="text" name="full_name" value={repFormData.full_name} onChange={handleRepChange} placeholder="P.ej. Ana Silva" className="w-full px-3 py-1.5 text-sm bg-gray-50 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"/>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">Cédula *</label>
                                                            <div className="flex">
                                                                <select name="cedula_type" value={repFormData.cedula_type} onChange={handleRepChange} className="w-12 px-1 text-sm bg-gray-50 border border-r-0 rounded-l-md"><option>V</option><option>E</option></select>
                                                                <input type="text" name="cedula_number" value={repFormData.cedula_number} onChange={(e) => handleRepChange({target: {name:'cedula_number', value: e.target.value.replace(/[^\d ]/g, '').slice(0, 12)}})} className="w-full px-2 py-1.5 text-sm bg-gray-50 border rounded-r-md min-w-0" placeholder="12345678"/>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">Teléfono *</label>
                                                            <div className="flex">
                                                                <select name="phone_code" value={repFormData.phone_code} onChange={handleRepChange} className="w-16 px-1 text-xs bg-gray-50 border border-r-0 rounded-l-md"><option>0412</option><option>0414</option><option>0424</option><option>0416</option><option>0426</option></select>
                                                                <input type="text" name="phone_number" value={repFormData.phone_number} onChange={(e) => handleRepChange({target: {name:'phone_number', value: e.target.value.replace(/\D/g, '').slice(0, 7)}})} className="w-full px-2 py-1.5 text-sm bg-gray-50 border rounded-r-md min-w-0" placeholder="1234567"/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={handleRepSubmit} disabled={repLoading} className={`w-full py-2 mt-2 rounded-md text-sm font-medium text-white transition-all ${repLoading ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}`}>
                                                        {repLoading ? 'Guardando...' : 'Guardar y Asignar Representante'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        </>
                                    ) : (
                                        <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800">
                                            {selectedRepresentative ? `${selectedRepresentative.full_name} (${selectedRepresentative.cedula})` : 'No asignado'}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-0 !mt-0">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Parentesco / Relación <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="representative_relationship"
                                        value={formData.representative_relationship}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required={isMinorOrUndocumented}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800"
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="Madre">Madre</option>
                                        <option value="Padre">Padre</option>
                                        <option value="Abuelo(a)">Abuelo(a)</option>
                                        <option value="Tutor Legal">Tutor Legal</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

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
                                <option value="">Seleccione...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                    </div>

                    {/* Marital Status */}
                    {!isMinorOrUndocumented && (
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
                                  <option value="">Seleccione...</option>
                                  <option value="Soltero">Soltero</option>
                                  <option value="Casado">Casado</option>
                                  <option value="Divorciado">Divorciado</option>
                                  <option value="Viudo">Viudo</option>
                                  <option value="Unión Libre">Unión Libre</option>
                              </select>
                          </div>
                      </div>
                    )}
                </div>
            </div>

            {/* Section: Contact Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Phone className="w-4 h-4 text-blue-500" />
                    Información de Contacto
                </h3>
                
                {isMinorOrUndocumented ? (
                    <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100 mb-6 flex items-start gap-4">
                        <div className="p-2.5 bg-blue-100 rounded-full shrink-0 mt-0.5">
                            <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-900 mb-1">Configuración de Contacto Delegada</p>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                El paciente está registrado como menor de edad o persona sin identificación propia. El sistema utilizará automáticamente la información de contacto (teléfono y correo) de su representante legal ({selectedRepresentative ? selectedRepresentative.full_name : 'No asignado'}) para el envío de notificaciones y recordatorios de citas.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Phone */}
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                                Teléfono <span className="text-red-500">*</span>
                            </label>
                            <div className="relative flex">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                </div>
                                <select
                                    name="phone_code"
                                    value={formData.phone_code}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="pl-10 pr-2 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800 w-24 appearance-none"
                                >
                                    <option value="0412">0412</option>
                                    <option value="0422">0422</option>
                                    <option value="0416">0416</option>
                                    <option value="0426">0426</option>
                                    <option value="0414">0414</option>
                                    <option value="0424">0424</option>
                                </select>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 7);
                                        handleChange({ target: { name: 'phone_number', value: val } });
                                    }}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100/50 font-medium text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                                Email
                            </label>
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
                    </div>
                )}

                <div className="md:col-span-2 group mt-6">
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
                        setIsMinorOrUndocumented(initiallyIsMinor);
                        setFormData(() => {
                            let cedulaType = 'V';
                            let cedulaNumber = '';
                            
                            if (patient.cedula) {
                                if (patient.cedula.includes('-')) {
                                    const parts = patient.cedula.split('-');
                                    cedulaType = parts[0];
                                    cedulaNumber = parts[1];
                                } else {
                                    cedulaNumber = patient.cedula;
                                }
                            }

                            const phone = patient.phone || '';
                            const phoneCode = phone.length >= 4 ? phone.substring(0, 4) : '0412';
                            const phoneNumber = phone.length > 4 ? phone.substring(4) : '';

                            return {
                            ...patient,
                            full_name: patient.full_name || '',
                            birth_date: patient.birth_date || '',
                            gender: patient.gender || '',
                            marital_status: patient.marital_status || '',
                            address: patient.address || '',
                            email: patient.email || '',
                            cedula_type: cedulaType,
                            cedula_number: cedulaNumber,
                            phone_code: phoneCode,
                            phone_number: phoneNumber,
                            representative_relationship: patient.representative_relationship || ''
                            };
                        });
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