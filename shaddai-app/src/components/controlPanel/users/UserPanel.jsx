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
  const [activeTab, setActiveTab] = useState('active');
  
  // Cargar datos iniciales
  useEffect(() => {
    const normalizeUsersResponse = (response) => {
      const payload = response?.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (payload && Array.isArray(payload.users)) return payload.users;
      return [];
    };

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar usuarios
        const usersRes = await userApi.getAll(token);
        setUsers(normalizeUsersResponse(usersRes));
        
        // Cargar especialidades
        const specsRes = await userApi.getSpecialties(token);
        setSpecialties(Array.isArray(specsRes?.data)
          ? specsRes.data
          : Array.isArray(specsRes?.data?.data)
            ? specsRes.data.data
            : []);
        
        // Cargar colegios médicos
        const collegesRes = await userApi.getMedicalColleges(token);
        setMedicalColleges(Array.isArray(collegesRes?.data)
          ? collegesRes.data
          : Array.isArray(collegesRes?.data?.data)
            ? collegesRes.data.data
            : []);
        
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
      setUsers(Array.isArray(users)
        ? users.map(user => 
            user.id === userId
              ? {
                  ...user,
                  active: user.active === 1 ? 0 : 1 // Cambio clave aquí
                }
              : user
          )
        : []);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      toast.error('Error al cambiar estado: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleResendInvitation = async (userId) => {
    try {
      await userApi.resendInvitation(userId, token);
      toast.success('Invitación reenviada correctamente');
    } catch (err) {
      console.error('Error al reenviar invitación:', err);
      toast.error('Error al reenviar invitación: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateSubmit = async (formData) => {
    try {
      await userApi.create(formData, token);
      const usersRes = await userApi.getAll(token);
      const payload = usersRes?.data;
      const refreshed = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.users)
            ? payload.users
            : [];
      setUsers(refreshed);
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
      setUsers(Array.isArray(users)
        ? users.map(user => user.id === editingUser.id ? updatedUser : user)
        : []);
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

  const filteredUsersByTab = Array.isArray(users) ? users.filter(u => {
      if (activeTab === 'pending') return u.registration_status === 'pending';
      return u.registration_status !== 'pending';
  }) : [];

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

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'active'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Usuarios Activos
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Invitaciones Pendientes
          {Array.isArray(users) && users.filter(u => u.registration_status === 'pending').length > 0 && (
             <span className="bg-red-500 text-white text-xs px-2 rounded-full">
                {users.filter(u => u.registration_status === 'pending').length}
             </span>
          )}
        </button>
      </div>

      {/* Mostrar tabla de usuarios */}
      <UserTable 
        users={filteredUsersByTab} 
        onEdit={handleEdit} 
        onToggleStatus={handleToggleStatus}
        medicalColleges={medicalColleges} // Pasamos los colegios médicos
        isPendingView={activeTab === 'pending'} // New prop
        onResendInvitation={handleResendInvitation} // New prop
      />

      {/* Formulario para crear usuario (modal) */}
      {showCreateForm && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
            <UserForm 
              onSubmit={handleCreateSubmit} 
              onCancel={handleFormClose}
              specialties={specialties}
              medicalColleges={medicalColleges}
            />
        </div>
      )}

      {/* Formulario para editar usuario (modal) */}
      {showEditForm && editingUser && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
            <UserEditForm 
              user={editingUser}
              onSubmit={handleEditSubmit} 
              onCancel={handleFormClose}
              specialties={specialties}
              medicalColleges={medicalColleges}
            />
        </div>
      )}
    </div>
  );
}