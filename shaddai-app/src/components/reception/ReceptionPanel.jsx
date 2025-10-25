import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  UserPlus,
  CalendarPlus,
  Search,
  FileText
} from 'lucide-react';
import PatientRegistration from './patients/PatientRegistration';
import PatientList from './patients/PatientsList';
import AppointmentForm from './appointments/AppointmentForm';
import AppointmentsList from './appointments/AppointmentsList';
import TodayScheduleCard from './appointments/TodayScheduleCard';
import AppointmentDetailModal from './appointments/AppointmentDetailModal';
import appointmentsApi from '../../api/appointments';
import { useAuth } from '../../context/AuthContext';
import StatsCard from './appointments/StatsCard';
import RecentActivityCard from './RecentActivityCard';

// Estilos base para tarjetas para mantener simetría y consistencia
const cardBase = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";

export default function ReceptionPanel() {
  const [activeModal, setActiveModal] = useState(null);
  const { token } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loadingToday, setLoadingToday] = useState(false);
  const [todayError, setTodayError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Efecto para controlar el scroll del body
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModal]);

  // Cargar agenda de hoy + auto refresh
  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const fetchToday = async () => {
      if (!token) return; // requiere autenticación
      try {
        if (isMounted) setLoadingToday(true);
        const res = await appointmentsApi.getToday(token);
        if (isMounted) {
          const data = res?.data;
          // Normalizar para asegurar siempre un arreglo
          let list = [];
          if (Array.isArray(data)) list = data;
          else if (Array.isArray(data?.data)) list = data.data;
          else if (Array.isArray(data?.appointments)) list = data.appointments;
          else list = [];

          setTodayAppointments(list);
          setTodayError(null);
        }
      } catch (err) {
        if (isMounted) setTodayError(err.response?.data?.message || 'No se pudo cargar la agenda de hoy');
      } finally {
        if (isMounted) setLoadingToday(false);
      }
    };

    fetchToday();
    // refrescar cada 15s
    intervalId = setInterval(fetchToday, 15000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [token]);

  const openAppointmentDetail = async (appt) => {
    if (!appt) return;
    setLoadingDetail(true);
    try {
      let full = appt;
      if (!appt.patient_name || !appt.doctor_name || !appt.appointment_date) {
        // Cargar detalles si la respuesta es mínima
        const res = await appointmentsApi.getById(appt.id || appt.appointment_id, token);
        full = res.data?.data || res.data;
      }
      setSelectedAppointment(full);
      setShowAppointmentDetail(true);
    } catch (err) {
      console.error('Error cargando detalles de la cita', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Header />
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 ">
          {/* Quick Actions - Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <QuickActionsCard onAction={openModal} />
            <StatsCard />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-6 space-y-6">
            <TodayScheduleCard 
              items={todayAppointments}
              loading={loadingToday}
              error={todayError}
              onItemClick={openAppointmentDetail}
              onViewAll={() => setActiveModal('consult')}
            />
            <RecentActivityCard />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <NotificationsCard />
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'register' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] transform transition-all duration-300">
            <PatientRegistration onClose={closeModal} />
          </div>
        </div>
      )}

      {activeModal === 'list' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
            <PatientList onClose={closeModal} />
          </div>
        </div>
      )}

      {activeModal === 'schedule' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden transform transition-all duration-300">
            <AppointmentForm onClose={closeModal} />
          </div>
        </div>
      )}

      {activeModal === 'consult' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden transform transition-all duration-300">
            <AppointmentsList onClose={closeModal} />
          </div>
        </div>
      )}

      {/* Modal Detalle de Cita */}
      {showAppointmentDetail && selectedAppointment && (
        <AppointmentDetailModal 
          appointment={selectedAppointment}
          onClose={() => {
            setShowAppointmentDetail(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}

// Header Component
function Header() {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={cardBase}>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Recepción
          </h1>
          <p className="text-gray-600 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {currentDate}
          </p>
        </div>
      </div>
    </div>
  );
}

// Quick Actions Card
function QuickActionsCard({ onAction }) {
  const actions = [
    {
      id: 'register',
      title: "Registrar Paciente",
      icon: UserPlus,
      color: "bg-green-500 hover:bg-green-600",
      description: "Nuevo paciente"
    },
    {
      id: 'schedule',
      title: "Agendar Cita",
      icon: CalendarPlus,
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Nueva cita"
    },
    {
      id: 'list',
      title: "Buscar Pacientes",
      icon: Search,
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Ver listado"
    },
    {
      id: 'consult',
      title: "Consultar Citas",
      icon: FileText,
      color: "bg-orange-500 hover:bg-orange-600",
      description: "Ver agenda"
    }
  ];

  return (
    <div className={cardBase}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`w-full ${action.color} text-white p-4 h-14 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center group`}
            >
              <Icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left flex-1">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}



// RecentActivityCard moved to its own file

// Notifications Card
function NotificationsCard() {
  const notifications = [
    {
      type: "warning",
      title: "Cita próxima",
      message: "Juan Pérez en 30 minutos",
      icon: AlertCircle,
      color: "text-yellow-600"
    },
    {
      type: "info",
      title: "Recordatorio",
      message: "Confirmar citas de mañana",
      icon: Clock,
      color: "text-blue-600"
    }
  ];

  return (
    <div className={cardBase}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones</h3>
      
      <div className="space-y-3">
        {notifications.map((notification, index) => {
          const Icon = notification.icon;
          return (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 ${notification.color} mt-0.5`} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{notification.title}</div>
                  <div className="text-xs text-gray-600">{notification.message}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// (Eliminado componente de Estado del Sistema)
