// UserPanel.jsx
import React, { useState, useEffect } from 'react';
import userApi from '../../../api/userApi';
import UserTable from './UserTable';
import UserForm from './UserForm';
import UserEditForm from './UserEditForm';
import { useAuth } from '../../../context/AuthContext';

export default function UserPanel() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [medicalColleges, setMedicalColleges] = useState([]);
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar usuarios
        const usersRes = await userApi.getAll(token);
        setUsers(usersRes.data);
        
        // Cargar especialidades
        const specsRes = await userApi.getSpecialties(token);
        setSpecialties(specsRes.data);
        
        // Cargar colegios médicos
        const collegesRes = await userApi.getMedicalColleges(token);
        setMedicalColleges(collegesRes.data);
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar datos');
        console.error(err);
        setLoading(false);
      }
    };
    
    loadData();
  }, [token]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowEditForm(true);
  };

  const handleCreate = () => {
    setShowCreateForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await userApi.delete(userId, token);
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        alert('Error al eliminar usuario: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await userApi.toggleStatus(userId, token);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, active: !user.active } : user
      ));
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al cambiar estado: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateSubmit = async (formData) => {
  try {
    await userApi.create(formData, token);
    // Recarga la lista completa de usuarios
    const usersRes = await userApi.getAll(token);
    setUsers(usersRes.data);
    setShowCreateForm(false);
    alert('Usuario creado exitosamente');
  } catch (err) {
    console.error('Error al crear usuario:', err);
    alert('Error al crear: ' + (err.response?.data?.message || err.message));
  }
};


  const handleEditSubmit = async (formData) => {
  try {
    if (formData.birth_date === '') formData.birth_date = null;

    // response is already the user object updated (response.data)
    const updatedUser = await userApi.update(editingUser.id, formData, token);

    setUsers(users.map(user =>
      user.id === editingUser.id ? updatedUser : user
    ));

    setShowEditForm(false);
    setEditingUser(null);
    alert('Usuario actualizado exitosamente');
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    // manejo de errores como antes
    let errorMessage = 'Error al actualizar';
    if (err.response) {
      if (err.response.data && err.response.data.error) {
        errorMessage += `: ${err.response.data.error}`;
      } else {
        errorMessage += `: ${err.response.status} ${err.response.statusText}`;
      }
    } else if (err.message) {
      errorMessage += `: ${err.message}`;
    }
    alert(errorMessage);
  }
};


  const handleFormClose = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingUser(null);
  };

  if (loading) return <div className="text-center py-10">Cargando usuarios...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Mostrar tabla de usuarios */}
      <UserTable 
        users={users} 
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Formulario para crear usuario (modal) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <UserForm 
              onSubmit={handleCreateSubmit} 
              onCancel={handleFormClose}
              specialties={specialties}
              medicalColleges={medicalColleges}
            />
          </div>
        </div>
      )}

      {/* Formulario para editar usuario (modal) */}
      {showEditForm && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <UserEditForm 
              user={editingUser}
              onSubmit={handleEditSubmit} 
              onCancel={handleFormClose}
              specialties={specialties}
              medicalColleges={medicalColleges}
            />
          </div>
        </div>
      )}
    </div>
  );
}