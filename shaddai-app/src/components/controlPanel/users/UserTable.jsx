// UserTable.jsx
import React from 'react';

export default function UserTable({ users, onEdit, onDelete, onToggleStatus }) {
  // Función para obtener el nombre de los roles (maneja diferentes formatos)
  const getRoleNames = (roles) => {
    if (!roles) return '';
    
    // Si los roles son array de objetos
    if (roles[0] && typeof roles[0] === 'object') {
      return roles.map(role => {
        switch (role.name) {
          case 'admin': return 'Administrador';
          case 'medico': return 'Médico';
          case 'recepcionista': return 'Recepcionista';
          default: return role.name;
        }
      }).join(', ');
    }
    // Si los roles son array de IDs
    else {
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.id || "Cargando..." }
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                  {user.medical_info && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Médico
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.cedula}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getRoleNames(user.roles)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(user)}
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(user.id)}
                  className="text-red-600 hover:text-red-900 mr-3"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => onToggleStatus(user.id)}
                  className={`${
                    user.active 
                      ? 'text-yellow-600 hover:text-yellow-900' 
                      : 'text-green-600 hover:text-green-900'
                  }`}
                >
                  {user.active ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}