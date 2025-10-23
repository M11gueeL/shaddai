import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Clock, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  UserPlus,
  CalendarPlus,
  Search,
  FileText
} from 'lucide-react';
import PatientRegistration from './patients/PatientRegistration';
import PatientList from './patients/PatientsList';
import AppointmentForm from './appointments/AppointmentForm';

export default function ReceptionPanel() {
  const [activeModal, setActiveModal] = useState(null);

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

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Header />
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Actions - Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <QuickActionsCard onAction={openModal} />
            <TodayStatsCard />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-6 space-y-6">
            <TodayScheduleCard />
            <RecentActivityCard />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <NotificationsCard />
            <SystemStatusCard />
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'register' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] transform transition-all duration-300">
            <PatientRegistration onClose={closeModal} />
          </div>
        </div>
      )}

      {activeModal === 'list' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
            <PatientList onClose={closeModal} />
          </div>
        </div>
      )}

      {activeModal === 'schedule' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden transform transition-all duration-300">
            <AppointmentForm onClose={closeModal} />
          </div>
        </div>
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="flex items-center text-green-600">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium">Sistema Activo</span>
          </div>
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`w-full ${action.color} text-white p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center group`}
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

// Today Stats Card
function TodayStatsCard() {
  const stats = [
    { label: "Citas Hoy", value: "12", icon: Calendar, color: "text-blue-600" },
    { label: "Pacientes", value: "156", icon: Users, color: "text-green-600" },
    { label: "Confirmadas", value: "8", icon: CheckCircle, color: "text-emerald-600" },
    { label: "Pendientes", value: "4", icon: Clock, color: "text-yellow-600" }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Icon className={`w-5 h-5 ${stat.color} mr-3`} />
                <span className="text-sm text-gray-700">{stat.label}</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Today Schedule Card
function TodayScheduleCard() {
  const todayAppointments = [
    {
      time: "09:00",
      patient: "María García",
      doctor: "Dr. Rodríguez",
      type: "Control",
      status: "confirmada"
    },
    {
      time: "09:30",
      patient: "Juan Pérez",
      doctor: "Dr. López",
      type: "Primera vez",
      status: "programada"
    },
    {
      time: "10:00",
      patient: "Ana Martínez",
      doctor: "Dr. Rodríguez",
      type: "Urgencia",
      status: "en_progreso"
    },
    {
      time: "10:30",
      patient: "Carlos Silva",
      doctor: "Dr. López",
      type: "Control",
      status: "programada"
    },
    {
      time: "11:00",
      patient: "Lucía Fernández",
      doctor: "Dr. Rodríguez",
      type: "Primera vez",
      status: "programada"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'programada': return 'bg-blue-100 text-blue-800';
      case 'en_progreso': return 'bg-yellow-100 text-yellow-800';
      case 'completada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Agenda de Hoy</h3>
        <span className="text-sm text-gray-500">23 de octubre, 2025</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {todayAppointments.map((appointment, index) => (
          <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0 w-16 text-center">
              <div className="text-lg font-bold text-gray-900">{appointment.time}</div>
            </div>
            
            <div className="flex-1 ml-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{appointment.patient}</div>
                  <div className="text-sm text-gray-600">{appointment.doctor}</div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{appointment.type}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm">
          Ver agenda completa →
        </button>
      </div>
    </div>
  );
}

// Recent Activity Card
function RecentActivityCard() {
  const activities = [
    {
      action: "Cita agendada",
      details: "María García - Dr. Rodríguez",
      time: "Hace 5 min",
      icon: CalendarPlus,
      color: "text-green-600"
    },
    {
      action: "Paciente registrado",
      details: "Carlos Silva",
      time: "Hace 12 min",
      icon: UserPlus,
      color: "text-blue-600"
    },
    {
      action: "Cita confirmada",
      details: "Ana Martínez - Dr. López",
      time: "Hace 18 min",
      icon: CheckCircle,
      color: "text-emerald-600"
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Icon className={`w-5 h-5 ${activity.color} mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{activity.action}</div>
                <div className="text-sm text-gray-600">{activity.details}</div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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

// System Status Card
function SystemStatusCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-700">Base de Datos</span>
          </div>
          <span className="text-sm font-medium text-green-600">Activo</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-700">API</span>
          </div>
          <span className="text-sm font-medium text-green-600">Activo</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <Activity className="w-4 h-4 text-blue-600 mr-3" />
            <span className="text-sm text-gray-700">Rendimiento</span>
          </div>
          <span className="text-sm font-medium text-blue-600">Óptimo</span>
        </div>
      </div>
    </div>
  );
}
