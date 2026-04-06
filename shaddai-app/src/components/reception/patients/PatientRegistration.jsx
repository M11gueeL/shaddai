import { useState } from 'react';
import PatientsApi from '../../../api/PatientsApi';
import { useToast } from '../../../context/ToastContext';
import { UserPlus, X, User, CreditCard, Calendar, Phone, MapPin, Mail, Heart, Users, Search, Loader2 } from 'lucide-react';
import PatientSearch from '../appointments/PatientSearch';

export default function PatientRegistration({ onClose }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    cedula_type: 'V',
    cedula_number: '',
    birth_date: '',
    gender: '',
    marital_status: '',
    address: '',
    phone_code: '0412',
    phone_number: '',
    email: '',
    representative_id: '',
    representative_relationship: ''
  });
  const [isMinorOrUndocumented, setIsMinorOrUndocumented] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [loading, setLoading] = useState(false);
  

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

    if (isMinorOrUndocumented && (!selectedRepresentative || !formData.representative_relationship)) {
      toast.error('Debe seleccionar un representante y especificar el parentesco.');
      return;
    }

    if (!isMinorOrUndocumented && !formData.cedula_number) {
        toast.error('La cédula es requerida si el paciente posee una.');
        return;
    }

    setLoading(true);
    
    try {
      // Combinar campos
      const payload = {
        ...formData,
        cedula: isMinorOrUndocumented ? null : `${formData.cedula_type}-${formData.cedula_number}`,
        phone: isMinorOrUndocumented ? null : (formData.phone_number ? `${formData.phone_code}${formData.phone_number}` : ''),
        email: isMinorOrUndocumented ? null : formData.email,
        representative_id: isMinorOrUndocumented && selectedRepresentative ? selectedRepresentative.id : null,
        representative_relationship: isMinorOrUndocumented ? formData.representative_relationship : null,
        marital_status: isMinorOrUndocumented ? null : formData.marital_status
      };

      // Eliminar campos temporales
      delete payload.cedula_type;
      delete payload.cedula_number;
      delete payload.phone_code;
      delete payload.phone_number;

      await PatientsApi.create(payload);
      toast.success('Paciente registrado con éxito');
      onClose(); // Cerrar modal inmediatamente tras éxito
      
    } catch (error) {
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error('Error al registrar: ' + errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
      {/* Header del Modal */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
            {/* Fondo del icono cambiado a azul claro suave */}
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                {/* Icono cambiado a azul primario */}
                <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                {/* Título en negro/gris oscuro */}
                <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Paciente</h2>
                {/* Subtítulo en gris medio */}
                <p className="text-gray-500 text-sm">Complete la información para dar de alta un nuevo paciente</p>
            </div>
        </div>
        <button
          onClick={onClose}
          /* Botón de cerrar adaptado para fondo blanco */
          className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Contenido del Modal */}
      <div className="p-8 max-h-[calc(90vh-100px)] overflow-y-auto bg-gray-50/50">

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Sección: Información Personal */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <User className="w-4 h-4 text-blue-500" />
                Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                    Nombre Completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                        placeholder="Ej: Juan Pérez"
                    />
                </div>
                </div>

                <div className="group">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                        Cédula {!isMinorOrUndocumented && <span className="text-red-500">*</span>}
                    </label>
                    <div className="mb-2">
                        <label className="inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={isMinorOrUndocumented}
                                onChange={(e) => setIsMinorOrUndocumented(e.target.checked)}
                                className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500/20 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-600 font-medium">
                                El paciente es menor de edad / No posee cédula
                            </span>
                        </label>
                    </div>

                    {!isMinorOrUndocumented ? (
                        <div className="relative flex">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <CreditCard className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <select
                                name="cedula_type"
                                value={formData.cedula_type}
                                onChange={handleChange}
                                className="pl-10 pr-2 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 appearance-none cursor-pointer w-20"
                            >
                                <option value="V">V</option>
                                <option value="E">E</option>
                            </select>
                            <input
                                type="text"
                                name="cedula_number"
                                value={formData.cedula_number}
                                onChange={(e) => {
                                    // Allow digits and spaces, max length 12 (e.g. 100 000 000)
                                    const val = e.target.value.replace(/[^\d ]/g, '').slice(0, 12);
                                    handleChange({ target: { name: 'cedula_number', value: val } });
                                }}
                                required={!isMinorOrUndocumented}
                                minLength={6}
                                maxLength={12}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                                placeholder="12 345 678"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4 pt-1 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                            <div className="rounded-lg border border-blue-200 bg-white/80 p-3">
                                <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                                    <Search className="w-3.5 h-3.5 text-blue-600" />
                                    Buscar Representante Legal <span className="text-red-500">*</span>
                                </label>
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
                            </div>

                            {showRepForm && (
                                <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl shadow-sm border border-slate-200 mt-3 animate-in slide-in-from-top-2 fade-in-50 duration-300">
                                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                                        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
                                                <User className="w-3.5 h-3.5"/>
                                            </div>
                                            Nuevo Representante
                                        </h4>
                                        <button type="button" onClick={() => setShowRepForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] uppercase font-semibold tracking-wide text-slate-500 mb-1">Nombre *</label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={repFormData.full_name}
                                                onChange={handleRepChange}
                                                placeholder="P.ej. Ana Silva"
                                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] uppercase font-semibold tracking-wide text-slate-500 mb-1">Cédula *</label>
                                                <div className="flex">
                                                    <select name="cedula_type" value={repFormData.cedula_type} onChange={handleRepChange} className="w-12 px-1 text-sm bg-white border border-r-0 border-slate-200 rounded-l-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"><option>V</option><option>E</option></select>
                                                    <input type="text" name="cedula_number" value={repFormData.cedula_number} onChange={(e) => handleRepChange({target: {name:'cedula_number', value: e.target.value.replace(/[^\d ]/g, '').slice(0, 12)}})} className="w-full px-2 py-2 text-sm bg-white border border-slate-200 rounded-r-md min-w-0 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="12345678"/>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase font-semibold tracking-wide text-slate-500 mb-1">Teléfono *</label>
                                                <div className="flex">
                                                    <select name="phone_code" value={repFormData.phone_code} onChange={handleRepChange} className="w-16 px-1 text-xs bg-white border border-r-0 border-slate-200 rounded-l-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"><option>0412</option><option>0422</option><option>0414</option><option>0424</option><option>0416</option><option>0426</option></select>
                                                    <input type="text" name="phone_number" value={repFormData.phone_number} onChange={(e) => handleRepChange({target: {name:'phone_number', value: e.target.value.replace(/\D/g, '').slice(0, 7)}})} className="w-full px-2 py-2 text-sm bg-white border border-slate-200 rounded-r-md min-w-0 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="1234567"/>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRepSubmit}
                                            disabled={repLoading}
                                            className={`w-full py-2.5 mt-2 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 ${repLoading ? 'bg-blue-500/80 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'}`}
                                        >
                                            {repLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Guardando representante...
                                                </>
                                            ) : (
                                                'Guardar y Asignar Representante'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Parentesco / Relación <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="representative_relationship"
                                    value={formData.representative_relationship}
                                    onChange={handleChange}
                                    required={isMinorOrUndocumented}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800"
                                >
                                    <option value="">Seleccionar parentesco...</option>
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
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                    Fecha de Nacimiento
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800"
                    />
                </div>
                </div>

                <div className="group">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                    Género
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 appearance-none cursor-pointer"
                    >
                        <option value="">Seleccione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                </div>
                </div>

                {!isMinorOrUndocumented && (
                  <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                      Estado Civil
                  </label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Heart className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <select
                          name="marital_status"
                          value={formData.marital_status}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 appearance-none cursor-pointer"
                      >
                          <option value="">Seleccione...</option>
                          <option value="Soltero">Soltero</option>
                          <option value="Casado">Casado</option>
                          <option value="Divorciado">Divorciado</option>
                          <option value="Viudo">Viudo</option>
                      </select>
                  </div>
                  </div>
                )}
            </div>
          </div>

          {/* Sección: Información de Contacto */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Phone className="w-4 h-4 text-blue-500" />
                Información de Contacto
            </h3>
            
            {isMinorOrUndocumented ? (
                <div className="bg-blue-50/80 p-4 rounded-lg border border-blue-100 mb-6 flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full shrink-0">
                        <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-900">Configuración de Contacto Delegada</p>
                        <p className="text-xs text-blue-700 mt-1">
                            Como el paciente es menor de edad, el sistema utilizará automáticamente el teléfono y correo electrónico de su representante legal ({selectedRepresentative ? selectedRepresentative.full_name : 'aún no seleccionado'}) para el envío de notificaciones y recordatorios.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                        Teléfono <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                            <Phone className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <select
                            name="phone_code"
                            value={formData.phone_code}
                            onChange={handleChange}
                            required={!isMinorOrUndocumented}
                            className="pl-10 pr-2 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 appearance-none cursor-pointer w-24"
                        >
                            <option value="0412">0412</option>
                            <option value="0422">0422</option>
                            <option value="0416">0416</option>
                            <option value="0426">0426</option>
                            <option value="0414">0414</option>
                            <option value="0424">0424</option>
                        </select>
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 7);
                                handleChange({ target: { name: 'phone_number', value: val } });
                            }}
                            required={!isMinorOrUndocumented}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                            placeholder="1234567"
                        />
                    </div>
                    </div>

                    <div className="group">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                        Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    </div>
                </div>
            )}

            <div className="md:col-span-2 group mt-6">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                    Dirección
                </label>
                <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <MapPin className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="2"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400 resize-none"
                        placeholder="Ingrese la dirección completa"
                    />
                </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Registrando...
                </>
              ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    Registrar Paciente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}