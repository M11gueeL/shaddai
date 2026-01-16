import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, X, User, CreditCard, Calendar, Phone, MapPin, Mail, Lock, Shield, Stethoscope, Building2, FileText, Award, Users } from 'lucide-react';

export default function UserForm({ user, onSubmit, onCancel, specialties, medicalColleges }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    cedula_type: 'V',
    cedula_number: '',
    birth_date: '',
    gender: '',
    address: '',
    phone_code: '0412',
    phone_number: '',
    email: '',
    password: '',
    roles: [],
    mpps_code: '',
    medical_college_id: '',
    college_code: '',
    specialties: [],
  });
  
  const [errors, setErrors] = useState({});
  const isMedico = formData.roles.includes(2);

  useEffect(() => {
    if (user) {
      // Parsear cédula
      let cType = 'V';
      let cNum = '';
      if (user.cedula) {
        const parts = user.cedula.split('-');
        if (parts.length === 2) {
          cType = parts[0];
          cNum = parts[1];
        } else {
          cNum = user.cedula;
        }
      }

      // Parsear teléfono
      let pCode = '0412';
      let pNum = '';
      if (user.phone) {
        // Intentar extraer código (primeros 4 dígitos)
        const cleanPhone = user.phone.replace(/\D/g, '');
        if (cleanPhone.length >= 4) {
          pCode = cleanPhone.substring(0, 4);
          pNum = cleanPhone.substring(4);
        } else {
          pNum = cleanPhone;
        }
      }

      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        cedula_type: cType,
        cedula_number: cNum,
        birth_date: user.birth_date || '',
        gender: user.gender || '',
        address: user.address || '',
        phone_code: pCode,
        phone_number: pNum,
        email: user.email || '',
        password: '',
        roles: user.roles.map(role => role.id) || [],
        mpps_code: user.medical_info?.mpps_code || '',
        medical_college_id: user.medical_info?.medical_college_id || '',
        college_code: user.medical_info?.college_code || '',
        specialties: user.specialties?.map(spec => spec.id) || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const roleId = parseInt(e.target.value);
    const newRoles = e.target.checked
      ? [...formData.roles, roleId]
      : formData.roles.filter(id => id !== roleId);
    
    setFormData(prev => ({ ...prev, roles: newRoles }));
  };

  const handleSpecialtyChange = (e) => {
    const specialtyId = parseInt(e.target.value);
    const newSpecialties = e.target.checked
      ? [...formData.specialties, specialtyId]
      : formData.specialties.filter(id => id !== specialtyId);
    
    setFormData(prev => ({ ...prev, specialties: newSpecialties }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.first_name) newErrors.first_name = 'Nombre es requerido';
    if (!formData.last_name) newErrors.last_name = 'Apellido es requerido';
    if (!formData.cedula_number) newErrors.cedula = 'Cédula es requerida';
    if (!formData.email) newErrors.email = 'Email es requerido para enviar invitación';
    // Password not required for creation (invitation) or edit (optional)
    if (formData.roles.length === 0) newErrors.roles = 'Debe seleccionar al menos un rol';
    
    if (isMedico) {
      if (!formData.mpps_code) newErrors.mpps_code = 'Código MPPS es requerido';
      if (!formData.medical_college_id) newErrors.medical_college_id = 'Colegio médico es requerido';
      if (!formData.college_code) newErrors.college_code = 'Código de colegio es requerido';
      if (formData.specialties.length === 0) newErrors.specialties = 'Debe seleccionar al menos una especialidad';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const payload = {
        ...formData,
        cedula: `${formData.cedula_type}-${formData.cedula_number}`,
        phone: formData.phone_number ? `${formData.phone_code}${formData.phone_number}` : ''
      };
      // Eliminar campos temporales
      delete payload.cedula_type;
      delete payload.cedula_number;
      delete payload.phone_code;
      delete payload.phone_number;

      onSubmit(payload);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-bold">{user ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h2>
                <p className="text-blue-100 text-sm">{user ? 'Actualiza la información del usuario' : 'Complete la información para dar de alta un nuevo usuario'}</p>
            </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/20 rounded-full text-blue-100 hover:text-white transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="p-8 max-h-[calc(90vh-100px)] overflow-y-auto bg-gray-50/50">
        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Personal Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400 ${errors.first_name ? 'border-red-500' : 'border-gray-200'}`}
                            />
                        </div>
                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                    </div>

                    {/* Last Name */}
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Apellido <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400 ${errors.last_name ? 'border-red-500' : 'border-gray-200'}`}
                            />
                        </div>
                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                    </div>

                    {/* Cedula */}
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Cédula <span className="text-red-500">*</span>
                        </label>
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
                                    const val = e.target.value.replace(/[^\d ]/g, '').slice(0, 12);
                                    handleChange({ target: { name: 'cedula_number', value: val } });
                                }}
                                required
                                minLength={6}
                                maxLength={12}
                                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-r-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400 ${errors.cedula ? 'border-red-500' : 'border-gray-200'}`}
                            />
                        </div>
                        {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                    </div>

                    {/* Birth Date */}
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
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Gender */}
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
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                            </select>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Teléfono
                        </label>
                        <div className="relative flex">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <Phone className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <select
                                name="phone_code"
                                value={formData.phone_code}
                                onChange={handleChange}
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
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 7);
                                    handleChange({ target: { name: 'phone_number', value: val } });
                                }}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Email <span className="text-red-500">*</span>
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
                                required
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Password - Only shown for editing */}
                    {user && (
                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                Contraseña (Opcional)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400`}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Dejar en blanco para mantener la contraseña actual.</p>
                        </div>
                    )}

                    {/* Address */}
                    <div className="group md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Dirección
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                                <MapPin className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Roles */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    Roles del Usuario
                </h3>
                
                {errors.roles && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">{errors.roles}</p>
                </div>}
                
                <div className="flex flex-wrap gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {[
                    { id: 1, label: 'Administrador' },
                    { id: 2, label: 'Médico' },
                    { id: 3, label: 'Recepcionista' }
                  ].map(role => (
                    <label key={role.id} className="flex items-center space-x-2 cursor-pointer group">
                        <div className="relative">
                        <input
                            type="checkbox"
                            value={role.id}
                            checked={formData.roles.includes(role.id)}
                            onChange={handleRoleChange}
                            className="sr-only"
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${
                            formData.roles.includes(role.id) ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                            formData.roles.includes(role.id) ? 'transform translate-x-4' : ''
                        }`}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{role.label}</span>
                    </label>
                  ))}
                </div>
            </div>

            {/* Medical Info */}
            {isMedico && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <Stethoscope className="w-4 h-4 text-blue-500" />
                        Información Médica
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* MPPS */}
                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                Código MPPS <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FileText className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="mpps_code"
                                    value={formData.mpps_code}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400 ${errors.mpps_code ? 'border-red-500' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.mpps_code && <p className="text-red-500 text-xs mt-1">{errors.mpps_code}</p>}
                        </div>

                        {/* College */}
                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                Colegio Médico <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <select
                                    name="medical_college_id"
                                    value={formData.medical_college_id}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 appearance-none cursor-pointer ${errors.medical_college_id ? 'border-red-500' : 'border-gray-200'}`}
                                >
                                    <option value="">Seleccionar...</option>
                                    {medicalColleges.map(college => (
                                    <option key={college.id} value={college.id}>
                                        {college.full_name} ({college.abbreviation})
                                    </option>
                                    ))}
                                </select>
                            </div>
                            {errors.medical_college_id && <p className="text-red-500 text-xs mt-1">{errors.medical_college_id}</p>}
                        </div>

                        {/* College Code */}
                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                                Código de Colegio <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FileText className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="college_code"
                                    value={formData.college_code}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400 ${errors.college_code ? 'border-red-500' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.college_code && <p className="text-red-500 text-xs mt-1">{errors.college_code}</p>}
                        </div>
                    </div>

                    {/* Specialties */}
                    <div className="mt-6">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">
                            Especialidades <span className="text-red-500">*</span>
                        </label>
                        {errors.specialties && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <p className="text-red-700 text-sm">{errors.specialties}</p>
                        </div>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-4 border border-gray-200 rounded-xl bg-gray-50">
                            {specialties.map(specialty => (
                                <label key={specialty.id} className="flex items-center bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        value={specialty.id}
                                        checked={formData.specialties.includes(specialty.id)}
                                        onChange={handleSpecialtyChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-sm text-gray-700 group-hover:text-blue-700 transition-colors">{specialty.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
                >
                  {user ? 'Actualizar Usuario' : 'Guardar y Enviar Invitación'}
                </button>
            </div>

        </form>
      </div>
    </div>
  ); 
}