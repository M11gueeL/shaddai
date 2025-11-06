import React, { useState, useEffect } from 'react';
import userApi from '../../../api/userApi';
import UserTable from './UserTable';
import UserForm from './UserForm';
import UserEditForm from './UserEditForm';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function UserPanel() {
  const { token } = useAuth();
  const toast = useToast();
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

  // UserPanel.jsx
  const handleToggleStatus = async (userId) => {
    try {
      await userApi.toggleStatus(userId, token);
      setUsers(users.map(user => 
        user.id === userId ? { 
          ...user, 
          active: user.active === 1 ? 0 : 1  // Cambio clave aquí
        } : user
      ));
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      toast.error('Error al cambiar estado: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateSubmit = async (formData) => {
    try {
      await userApi.create(formData, token);
      const usersRes = await userApi.getAll(token);
      setUsers(usersRes.data);
      setShowCreateForm(false);
      toast.success('Usuario creado exitosamente');
    } catch (err) {
      console.error('Error al crear usuario:', err);
      toast.error('Error al crear: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      if (formData.birth_date === '') formData.birth_date = null;
      const updatedUser = await userApi.update(editingUser.id, formData, token);
      setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user));
      setShowEditForm(false);
      setEditingUser(null);
      toast.success('Usuario actualizado exitosamente');
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
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
      toast.error(errorMessage);
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
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Mostrar tabla de usuarios */}
      <UserTable 
        users={users} 
        onEdit={handleEdit} 
        onToggleStatus={handleToggleStatus}
        medicalColleges={medicalColleges} // Pasamos los colegios médicos
      />

      {/* Formulario para crear usuario (modal) */}
      {showCreateForm && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-2xl p-2 w-full max-w-3xl max-h-[95vh] overflow-y-auto">
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
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-2xl p-2 w-full max-w-3xl max-h-[95vh] overflow-y-auto">
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