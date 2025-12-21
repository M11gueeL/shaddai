import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  // ... (handleRoleChange, handleSpecialtyChange, handleFormClose remain same)

  const validate = () => {
    const newErrors = {};
    
    if (!formData.first_name) newErrors.first_name = 'Nombre es requerido';
    if (!formData.last_name) newErrors.last_name = 'Apellido es requerido';
    if (!formData.cedula_number) newErrors.cedula = 'Cédula es requerida';
    // Email is now optional
    if (!user && !formData.password) newErrors.password = 'Contraseña es requerida';
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
    <div className="min-h-screen flex items-start justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white">
              {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <p className="text-indigo-100 mt-1">
              {user ? 'Actualiza la información del usuario' : 'Completa los datos para crear un nuevo usuario'}
            </p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                      Nombre *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-6 left-0 pl-3 flex items-center pointer-events-none top-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition ${
                          errors.first_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                  </div>
                  
                  {/* Apellido */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                      Apellido *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-6 left-0 pl-3 flex items-center pointer-events-none top-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                  </div>
                  
                  {/* Cédula */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                      Cédula *
                    </label>
                    <div className="relative flex">
                      <div className="absolute inset-y-6 left-0 pl-3 flex items-center pointer-events-none top-0 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <select
                        name="cedula_type"
                        value={formData.cedula_type}
                        onChange={handleChange}
                        className="pl-10 pr-2 py-3 border border-r-0 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition w-20"
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
                        required
                        minLength={6}
                        maxLength={12}
                        className={`w-full px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition ${
                          errors.cedula ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.cedula && <p className="text-red-500 text-sm mt-1">{errors.cedula}</p>}
                  </div>
                  
                  {/* Fecha de Nacimiento */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                      Fecha de Nacimiento
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-6 left-0 pl-3 flex items-center pointer-events-none top-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                      />
                    </div>
                  </div>
                  
                  {/* Género */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                      Género
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                    >
                      <option value="">Seleccion una opción</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                  
                  {/* Teléfono */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                      Teléfono *
                    </label>
                    <div className="relative flex">
                      <div className="absolute inset-y-5 left-0 pl-3 flex items-center pointer-events-none top-0 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <select
                        name="phone_code"
                        value={formData.phone_code}
                        onChange={handleChange}
                        className="pl-10 pr-2 py-3 border border-r-0 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition w-24 appearance-none"
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
                        required
                        className="w-full px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition border-gray-300"
                      />
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                      Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-5 left-0 pl-3 flex items-center pointer-events-none top-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  {/* Contraseña */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                      Contraseña {user ? '(dejar en blanco para no cambiar)' : '*'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-6 left-0 pl-3 flex items-center pointer-events-none top-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                  
                  {/* Dirección */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                      Dirección
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-1 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Roles */}
              <div className="border-t pt-6">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Roles del Usuario</h3>
                </div>
                
                {errors.roles && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">{errors.roles}</p>
                </div>}
                
                <div className="flex flex-wrap gap-6 bg-gray-50 p-4 rounded-xl">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        value={1}
                        checked={formData.roles.includes(1)}
                        onChange={handleRoleChange}
                        className="sr-only"
                      />
                      <div className={`block w-12 h-6 rounded-full transition-colors ${
                        formData.roles.includes(1) ? 'bg-indigo-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        formData.roles.includes(1) ? 'transform translate-x-6' : ''
                      }`}></div>
                    </div>
                    <span className="text-gray-700 font-medium">Administrador</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        value={2}
                        checked={formData.roles.includes(2)}
                        onChange={handleRoleChange}
                        className="sr-only"
                      />
                      <div className={`block w-12 h-6 rounded-full transition-colors ${
                        formData.roles.includes(2) ? 'bg-indigo-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        formData.roles.includes(2) ? 'transform translate-x-6' : ''
                      }`}></div>
                    </div>
                    <span className="text-gray-700 font-medium">Médico</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        value={3}
                        checked={formData.roles.includes(3)}
                        onChange={handleRoleChange}
                        className="sr-only"
                      />
                      <div className={`block w-12 h-6 rounded-full transition-colors ${
                        formData.roles.includes(3) ? 'bg-indigo-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        formData.roles.includes(3) ? 'transform translate-x-6' : ''
                      }`}></div>
                    </div>
                    <span className="text-gray-700 font-medium">Recepcionista</span>
                  </label>
                </div>
              </div>
              
              {/* Campos específicos para médicos */}
              {isMedico && (
                <div className="border-t pt-6 space-y-6">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Información Médica</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Código MPPS */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                        Código MPPS *
                      </label>
                      <input
                        type="text"
                        name="mpps_code"
                        value={formData.mpps_code}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition ${
                          errors.mpps_code ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.mpps_code && <p className="text-red-500 text-sm mt-1">{errors.mpps_code}</p>}
                    </div>
                    
                    {/* Colegio Médico */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                        Colegio Médico *
                      </label>
                      <select
                        name="medical_college_id"
                        value={formData.medical_college_id}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition ${
                          errors.medical_college_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccionar colegio</option>
                        {medicalColleges.map(college => (
                          <option key={college.id} value={college.id}>
                            {college.full_name} ({college.abbreviation})
                          </option>
                        ))}
                      </select>
                      {errors.medical_college_id && <p className="text-red-500 text-sm mt-1">{errors.medical_college_id}</p>}
                    </div>
                    
                    {/* Código de Colegio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                        Código de Colegio *
                      </label>
                      <input
                        type="text"
                        name="college_code"
                        value={formData.college_code}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition ${
                          errors.college_code ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.college_code && <p className="text-red-500 text-sm mt-1">{errors.college_code}</p>}
                    </div>
                  </div>
                  
                  {/* Especialidades */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 pl-1">
                      Especialidades *
                    </label>
                    {errors.specialties && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm">{errors.specialties}</p>
                    </div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-4 border border-gray-200 rounded-xl bg-gray-50">
                      {specialties.map(specialty => (
                        <label key={specialty.id} className="flex items-center bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition">
                          <input
                            type="checkbox"
                            value={specialty.id}
                            checked={formData.specialties.includes(specialty.id)}
                            onChange={handleSpecialtyChange}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="ml-3 text-gray-700">{specialty.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-md text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  {user ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  ); 
}