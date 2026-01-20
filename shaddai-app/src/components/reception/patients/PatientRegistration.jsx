import { useState } from 'react';
import PatientsApi from '../../../api/PatientsApi';
import { useToast } from '../../../context/ToastContext';
import { UserPlus, X, User, CreditCard, Calendar, Phone, MapPin, Mail, Heart, Users } from 'lucide-react';

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
    email: ''
  });
  const [loading, setLoading] = useState(false);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Combinar campos
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

      await PatientsApi.create(payload);
      toast.success('Paciente registrado con éxito');
      onClose(); // Cerrar modal inmediatamente tras éxito
      
    } catch (error) {
      const errMsg = 'Error al registrar el paciente: ' + (error.response?.data?.message || error.message);
      toast.error(errMsg);
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
                            // Allow digits and spaces, max length 12 (e.g. 100 000 000)
                            const val = e.target.value.replace(/[^\d ]/g, '').slice(0, 12);
                            handleChange({ target: { name: 'cedula_number', value: val } });
                        }}
                        required
                        minLength={6}
                        maxLength={12}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                        placeholder="12 345 678"
                    />
                </div>
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
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                    </select>
                </div>
                </div>

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
            </div>
          </div>

          {/* Sección: Información de Contacto */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Phone className="w-4 h-4 text-blue-500" />
                Información de Contacto
            </h3>
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
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                        placeholder="1234567"
                    />
                </div>
                </div>

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
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                        placeholder="ejemplo@correo.com"
                    />
                </div>
                </div>

                <div className="md:col-span-2 group">
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