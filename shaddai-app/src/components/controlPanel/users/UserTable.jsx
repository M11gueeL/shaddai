import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiMail, FiPhone, FiFilter, 
  FiSearch, FiEdit2, FiToggleLeft, FiToggleRight, 
  FiInfo, FiShield, FiBook, FiAward, FiX
} from 'react-icons/fi';

const UserTable = ({ 
  users, 
  onEdit, 
  onToggleStatus,
  medicalColleges
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    isMedico: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const [viewingMedicalUser, setViewingMedicalUser] = useState(null);

  // Función para obtener el nombre de los roles
  const getRoleNames = (roles) => {
    if (!roles) return '';
    
    if (roles[0] && typeof roles[0] === 'object') {
      return roles.map(role => {
        switch (role.name) {
          case 'admin': return 'Administrador';
          case 'medico': return 'Médico';
          case 'recepcionista': return 'Recepcionista';
          default: return role.name;
        }
      }).join(', ');
    } else {
      return roles.map(roleId => {
        switch (roleId) {
          case 1: return 'Administrador';
          case 2: return 'Médico';
          case 3: return 'Recepcionista';
          default: return 'Desconocido';
        }
      }).join(', ');
    }
  };

  // Determina si un usuario es médico
  const isMedico = (user) => {
    if (user.roles) {
      if (user.roles[0] && typeof user.roles[0] === 'object') {
        return user.roles.some(role => role.name === 'medico');
      } else {
        return user.roles.includes(2);
      }
    }
    return false;
  };

  // Obtener nombre del colegio médico
  const getMedicalCollegeName = (collegeId) => {
    if (!medicalColleges || medicalColleges.length === 0) return 'Cargando...';
    
    const college = medicalColleges.find(c => c.id === collegeId);
    return college 
      ? `${college.full_name} (${college.abbreviation})` 
      : 'Colegio no encontrado';
  };

  // Filtrar usuarios con búsqueda avanzada
  useEffect(() => {
    let result = users;
    
    // Aplicar filtro de búsqueda avanzada
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      
      if (searchField !== 'all') {
        result = result.filter(user => {
          switch (searchField) {
            case 'id':
              return user.id.toString().includes(term);
            case 'name':
              return (
                (user.first_name && user.first_name.toLowerCase().includes(term)) ||
                (user.last_name && user.last_name.toLowerCase().includes(term))
              );
            case 'cedula':
              return user.cedula && user.cedula.toLowerCase().includes(term);
            case 'email':
              return user.email && user.email.toLowerCase().includes(term);
            case 'phone':
              return user.phone && user.phone.toLowerCase().includes(term);
            default:
              return true;
          }
        });
      } 
      else {
        result = result.filter(user => 
          (user.first_name && user.first_name.toLowerCase().includes(term)) ||
          (user.last_name && user.last_name.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term)) ||
          (user.cedula && user.cedula.toLowerCase().includes(term)) ||
          (user.phone && user.phone.toLowerCase().includes(term)) ||
          (user.id && user.id.toString().includes(term))
        );
      }
    }
    
    // Aplicar filtros adicionales
    if (filters.role) {
      result = result.filter(user => {
        const roles = getRoleNames(user.roles).toLowerCase();
        return roles.includes(filters.role.toLowerCase());
      });
    }
    
    // CORRECCIÓN: Filtrar por estado activo/inactivo (1/0)
    if (filters.status) {
      const statusValue = filters.status === 'active' ? 1 : 0;
      result = result.filter(user => user.active === statusValue);
    }
    
    if (filters.isMedico) {
      result = result.filter(user => isMedico(user));
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, searchField, filters]);

  // Manejar selección de usuario
  const handleSelectUser = (user) => {
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      role: '',
      status: '',
      isMedico: false
    });
  };

  // Abrir modal de información médica
  const openMedicalInfo = (user) => {
    setViewingMedicalUser(user);
    setShowMedicalInfo(true);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Barra de búsqueda y filtros */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1 flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* MEJORA: Selector con mejor diseño */}
            <div className="relative">
              <select
                className="appearance-none w-full border border-l-0 border-gray-300 rounded-r-lg pl-3 pr-8 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="all">Todos los campos</option>
                <option value="id">ID</option>
                <option value="name">Nombre</option>
                <option value="cedula">Cédula</option>
                <option value="email">Email</option>
                <option value="phone">Teléfono</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <FiFilter className="text-gray-500" />
              Filtros
            </button>
            
            {(filters.role || filters.status || filters.isMedico) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
        
        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* MEJORA: Selector de rol con mejor diseño */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <div className="relative">
                  <select
                    className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 pl-3 pr-8"
                    value={filters.role}
                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                  >
                    <option value="">Todos los roles</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Médico">Médico</option>
                    <option value="Recepcionista">Recepcionista</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* MEJORA: Selector de estado con mejor diseño */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <div className="relative">
                  <select
                    className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 pl-3 pr-8"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={filters.isMedico}
                    onChange={(e) => setFilters({...filters, isMedico: e.target.checked})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Solo médicos</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Información
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`${
                    selectedUser?.id === user.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  } transition-colors cursor-pointer`}
                  onClick={() => handleSelectUser(user)}
                >
                  <td className="px-2 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <div className={`flex items-center justify-center w-5 h-5 rounded-full border ${
                        selectedUser?.id === user.id
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      }`}>
                        {selectedUser?.id === user.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center mr-3">
                        <FiUser className="text-gray-600 text-lg" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {user.id} | Cédula: {user.cedula}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <FiMail className="mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center">
                        <FiPhone className="mr-2 text-gray-400" />
                        {user.phone || 'Sin teléfono'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getRoleNames(user.roles)}
                      {isMedico(user) && (
                        <div className="mt-1 flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <FiInfo className="mr-1" />
                            Información médica disponible
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.active === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.active === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <FiUser className="text-gray-500 text-2xl" />
                    </div>
                    <p className="text-lg font-medium text-gray-700">
                      No se encontraron usuarios
                    </p>
                    <p className="text-gray-500 mt-1">
                      Intenta ajustando tus filtros de búsqueda
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Buttons - Solo si hay un usuario seleccionado */}
      {selectedUser && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-3 sm:mb-0">
            <span className="text-sm text-gray-600 mr-3">Usuario seleccionado:</span>
            <span className="text-sm font-medium text-gray-900">
              {selectedUser.first_name} {selectedUser.last_name} ({selectedUser.email})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onEdit(selectedUser)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <FiEdit2 className="text-gray-600" />
              Editar
            </button>
            
            <button
              onClick={() => onToggleStatus(selectedUser.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                selectedUser.active === 1
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                  : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
              }`}
            >
              {selectedUser.active === 1 ? (
                <FiToggleLeft className="text-yellow-600" />
              ) : (
                <FiToggleRight className="text-green-600" />
              )}
              {selectedUser.active === 1 ? 'Desactivar' : 'Activar'}
            </button>
            
            {isMedico(selectedUser) && (
              <button
                onClick={() => openMedicalInfo(selectedUser)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 hover:bg-indigo-100 transition"
              >
                <FiInfo className="text-indigo-600" />
                Ver info. médica
              </button>
            )}
            
            <button
              onClick={() => setSelectedUser(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
              Deseleccionar
            </button>
          </div>
        </div>
      )}

      {/* Modal para Información Médica */}
      {showMedicalInfo && viewingMedicalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Información Médica</h2>
                <button 
                  onClick={() => setShowMedicalInfo(false)} 
                  className="text-white hover:text-gray-200"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="mt-4 flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                  <FiUser className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-lg font-semibold">{viewingMedicalUser.first_name} {viewingMedicalUser.last_name}</p>
                  <p className="text-indigo-100">{viewingMedicalUser.email}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <FiBook className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Código MPPS</h3>
                    <p className="text-lg font-semibold">
                      {viewingMedicalUser.medical_info?.mpps_code || 'No disponible'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <FiShield className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Colegio Médico</h3>
                    <p className="text-lg font-semibold">
                      {viewingMedicalUser.medical_info?.medical_college_id 
                        ? getMedicalCollegeName(viewingMedicalUser.medical_info.medical_college_id)
                        : 'No disponible'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <FiAward className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Código del Colegio</h3>
                    <p className="text-lg font-semibold">
                      {viewingMedicalUser.medical_info?.college_code || 'No disponible'}
                    </p>
                  </div>
                </div>
                
                {viewingMedicalUser.specialties && viewingMedicalUser.specialties.length > 0 && (
                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Especialidades</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingMedicalUser.specialties.map(specialty => (
                        <span 
                          key={specialty.id} 
                          className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {specialty.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowMedicalInfo(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;