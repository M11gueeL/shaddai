import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserForm({ user, onSubmit, onCancel, specialties, medicalColleges }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    cedula: '',
    birth_date: '',
    gender: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    roles: [],
    // Campos específicos para médicos
    mpps_code: '',
    medical_college_id: '',
    college_code: '',
    specialties: [],
  });
  
  const [errors, setErrors] = useState({});
  const isMedico = formData.roles.includes(2); // ID del rol médico

  // Inicializar datos si estamos editando
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        cedula: user.cedula || '',
        birth_date: user.birth_date || '',
        gender: user.gender || '',
        address: user.address || '',
        phone: user.phone || '',
        email: user.email || '',
        password: '', // No mostrar contraseña
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
    const isChecked = e.target.checked;
    
    setFormData(prev => {
      let newRoles = [...prev.roles];
      if (isChecked) {
        newRoles.push(roleId);
      } else {
        newRoles = newRoles.filter(id => id !== roleId);
      }
      return { ...prev, roles: newRoles };
    });
  };

  const handleSpecialtyChange = (e) => {
    const specialtyId = parseInt(e.target.value);
    const isChecked = e.target.checked;
    
    setFormData(prev => {
      let newSpecialties = [...prev.specialties];
      if (isChecked) {
        newSpecialties.push(specialtyId);
      } else {
        newSpecialties = newSpecialties.filter(id => id !== specialtyId);
      }
      return { ...prev, specialties: newSpecialties };
    });
  };

  
  const handleFormClose = () => {
    navigate('/controlpanel/users');
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.first_name) newErrors.first_name = 'Nombre es requerido';
    if (!formData.last_name) newErrors.last_name = 'Apellido es requerido';
    if (!formData.cedula) newErrors.cedula = 'Cédula es requerida';
    if (!formData.email) newErrors.email = 'Email es requerido';
    if (!user && !formData.password) newErrors.password = 'Contraseña es requerida';
    if (formData.roles.length === 0) newErrors.roles = 'Debe seleccionar al menos un rol';
    
    // Validaciones específicas para médicos
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
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">
        {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.first_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
          </div>
          
          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.last_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
          </div>
          
          {/* Cédula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula *
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.cedula ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cedula && <p className="text-red-500 text-sm mt-1">{errors.cedula}</p>}
          </div>
          
          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Género */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Seleccionar</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>
          
          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {user ? '(dejar en blanco para no cambiar)' : '*'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          
          {/* Dirección */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        {/* Roles */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles *
          </label>
          {errors.roles && <p className="text-red-500 text-sm mb-2">{errors.roles}</p>}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                value={1} // ID de admin
                checked={formData.roles.includes(1)}
                onChange={handleRoleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Administrador</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                value={2} // ID de médico
                checked={formData.roles.includes(2)}
                onChange={handleRoleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Médico</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                value={3} // ID de recepcionista
                checked={formData.roles.includes(3)}
                onChange={handleRoleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Recepcionista</span>
            </label>
          </div>
        </div>
        
        {/* Campos específicos para médicos */}
        {isMedico && (
          <div className="border-t pt-4 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Información Médica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Código MPPS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código MPPS *
                </label>
                <input
                  type="text"
                  name="mpps_code"
                  value={formData.mpps_code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.mpps_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.mpps_code && <p className="text-red-500 text-sm mt-1">{errors.mpps_code}</p>}
              </div>
              
              {/* Colegio Médico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colegio Médico *
                </label>
                <select
                  name="medical_college_id"
                  value={formData.medical_college_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Colegio *
                </label>
                <input
                  type="text"
                  name="college_code"
                  value={formData.college_code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.college_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.college_code && <p className="text-red-500 text-sm mt-1">{errors.college_code}</p>}
              </div>
            </div>
            
            {/* Especialidades */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidades *
              </label>
              {errors.specialties && <p className="text-red-500 text-sm mb-2">{errors.specialties}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 border border-gray-200 rounded-md">
                {specialties.map(specialty => (
                  <label key={specialty.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={specialty.id}
                      checked={formData.specialties.includes(specialty.id)}
                      onChange={handleSpecialtyChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">{specialty.name}</span>
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
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700"
          >
            {user ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}