import { useState, useEffect } from 'react';
import { Calendar, Clock, Users } from 'lucide-react';
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
import QuickActionsCard from './QuickActionsCard';
import MedicalSchedulesPanel from './medicalSchedules/MedicalSchedulesPanel';
import ReportsActions from './reports/ReportsActions';
import ElegantHeader from '../common/ElegantHeader';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        <ElegantHeader 
            icon={Users}
            sectionName="Recepción"
            title="Panel de"
            highlightText="Recepción"
            description="Gestiona citas, pacientes y la agenda del día desde un solo lugar."
        />

        {/* Quick Actions as horizontal bar */}
        <QuickActionsCard onAction={openModal} horizontal />

        {/* Two-column content: today schedule and recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 h-full">
            <TodayScheduleCard 
              items={todayAppointments}
              loading={loadingToday}
              error={todayError}
              onItemClick={openAppointmentDetail}
              onViewAll={() => setActiveModal('consult')}
            />
          </div>
          <div className="lg:col-span-5 h-full">
            <RecentActivityCard />
          </div>
        </div>

        {/* Footer-like section: stats (left) + reports actions (right) */}
        <div className="pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 h-full">
            <StatsCard />
          </div>
          <div className="lg:col-span-6 h-full">
            <ReportsActions />
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

      {activeModal === 'medicalSchedules' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden transform transition-all duration-300">
            <MedicalSchedulesPanel onClose={closeModal} />
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

// Header Component removed

