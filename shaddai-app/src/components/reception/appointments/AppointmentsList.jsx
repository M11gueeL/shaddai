import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import appointmentsAPI from '../../../api/appointments';
import AppointmentDetailModal from './AppointmentDetailModal';
import AppointmentsListView from './AppointmentsListView';
import AppointmentsCalendarView from './AppointmentsCalendarView';
import { getLocalDateString } from '../../../utils/dateUtils';

const AppointmentsList = ({ onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [showFilters, setShowFilters] = useState(true);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    date: '',
    doctor: '',
    dateRange: 'all' // today, week, month, all
  });

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cargar citas al montar
  useEffect(() => {
    loadAppointments();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [appointments, filters]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await appointmentsAPI.getAll(token);
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Filtro por búsqueda (paciente, doctor, etc.)
    if (filters.search) {
      filtered = filtered.filter(apt => 
        apt.patient_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        apt.doctor_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        apt.specialty_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        apt.chief_complaint?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    // Filtro por fecha específica
    if (filters.date) {
      filtered = filtered.filter(apt => apt.appointment_date === filters.date);
    }

    // Filtro por rango de fechas
    if (filters.dateRange !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(today);
      
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(apt => apt.appointment_date === getLocalDateString(today));
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(apt => {
            const [y, m, d] = apt.appointment_date.split('-');
            const aptDate = new Date(y, m - 1, d);
            return aptDate >= startDate;
          });
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(apt => {
            const [y, m, d] = apt.appointment_date.split('-');
            const aptDate = new Date(y, m - 1, d);
            return aptDate >= startDate;
          });
          break;
      }
    }

    // Ordenar por fecha y hora
    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.appointment_date} ${a.appointment_time}`);
      const dateTimeB = new Date(`${b.appointment_date} ${b.appointment_time}`);
      return dateTimeB - dateTimeA; // Más recientes primero
    });

    setFilteredAppointments(filtered);
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'programada': { icon: Clock, class: 'bg-blue-100 text-blue-800', label: 'Programada' },
      'confirmada': { icon: CheckCircle, class: 'bg-green-100 text-green-800', label: 'Confirmada' },
      'en_progreso': { icon: AlertCircle, class: 'bg-yellow-100 text-yellow-800', label: 'En Progreso' },
      'completada': { icon: CheckCircle, class: 'bg-gray-100 text-gray-800', label: 'Completada' },
      'cancelada': { icon: XCircle, class: 'bg-red-100 text-red-800', label: 'Cancelada' },
      'no_se_presento': { icon: XCircle, class: 'bg-orange-100 text-orange-800', label: 'No se Presentó' }
    };

    const config = statusConfig[status] || statusConfig['programada'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  // Eliminar cita de la lista tras borrado en modal
  const handleAppointmentDeleted = (deletedId) => {
    setAppointments(prev => prev.filter(a => a.id !== deletedId));
    setShowDetailModal(false);
    setSelectedAppointment(null);
  };

  // Paginación
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consultar Citas</h2>
          <p className="text-gray-600 mt-1">
            Gestiona y visualiza todas las citas programadas
          </p>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full transition-colors mr-2 ${showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
            title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Filtros y controles */}
      {showFilters && (
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por paciente, médico, especialidad..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          {/* Toggle de vista */}
          <div className="flex bg-white rounded-lg border border-gray-300 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendario
            </button>
          </div>
        </div>

        {/* Filtros adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">Todos los estados</option>
            <option value="programada">Programada</option>
            <option value="confirmada">Confirmada</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>

          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.date}
            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
          />

          <button
            onClick={() => setFilters({ search: '', status: 'all', date: '', dateRange: 'all' })}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <span>Total: {filteredAppointments.length}</span>
          <span>Confirmadas: {filteredAppointments.filter(a => a.status === 'confirmada').length}</span>
          <span>Hoy: {filteredAppointments.filter(a => a.appointment_date === getLocalDateString(new Date())).length}</span>
        </div>
      </div>
      )}

  {/* Contenido principal (ahora con scroll interno cuando el contenido excede la altura) */}
  <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : viewMode === 'list' ? (
          <AppointmentsListView 
            appointments={paginatedAppointments}
            onViewAppointment={handleViewAppointment}
            getStatusBadge={getStatusBadge}
          />
        ) : (
          <AppointmentsCalendarView 
            appointments={filteredAppointments}
            onViewAppointment={handleViewAppointment}
            getStatusBadge={getStatusBadge}
          />
        )}
      </div>

      {/* Paginación */}
      {viewMode === 'list' && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredAppointments.length)} de {filteredAppointments.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailModal && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setShowDetailModal(false)}
          onDeleted={handleAppointmentDeleted}
        />
      )}
    </div>
  );
};

export default AppointmentsList;
