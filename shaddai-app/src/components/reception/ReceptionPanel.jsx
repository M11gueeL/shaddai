import { useState, useEffect } from 'react';
import { ClipboardList, Clock3, FolderSearch, Plus, Users, FileText, Bell, UserPlus2, Sparkles, ChevronRight } from 'lucide-react';
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
import MedicalSchedulesPanel from './medicalSchedules/MedicalSchedulesPanel';
import ReportsHubModal from './reports/ReportsHubModal';
import NotificationRulesModal from './notifications/NotificationRulesModal';
import ElegantHeader from '../common/ElegantHeader';

export default function ReceptionPanel() {
  const [activeModal, setActiveModal] = useState(null);
  const { token, user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loadingToday, setLoadingToday] = useState(false);
  const [todayError, setTodayError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  const userRole = user?.roles?.includes('admin') ? 'admin' : 'staff';

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

    const fetchToday = async (isRefresh = false) => {
      if (!token) return; // requiere autenticación
      try {
        if (isMounted && !isRefresh) setLoadingToday(true);
        const res = await appointmentsApi.getToday();
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
        if (isMounted && !isRefresh) setLoadingToday(false);
      }
    };

    fetchToday();
    // refrescar cada 15s
    intervalId = setInterval(() => fetchToday(true), 15000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [token]);

  const openAppointmentDetail = async (appt) => {
    if (!appt) return;
    try {
      let full = appt;
      if (!appt.patient_name || !appt.doctor_name || !appt.appointment_date) {
        // Cargar detalles si la respuesta es mínima
        const res = await appointmentsApi.getById(appt.id || appt.appointment_id);
        full = res.data?.data || res.data;
      }
      setSelectedAppointment(full);
      setShowAppointmentDetail(true);
    } catch (err) {
      console.error('Error cargando detalles de la cita', err);
    }
  };

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 overflow-x-hidden bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_20%_20%,_rgba(14,165,233,0.10),transparent_28%),linear-gradient(to_bottom,#f8fafc,#ffffff,#eff6ff)]">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <ElegantHeader 
            icon={Users}
            sectionName="Recepción"
            title="Panel de"
            highlightText="Recepción"
            description="Gestiona pacientes, agenda médica y acciones críticas desde un solo centro de mando."
        >
          <StatsCard variant="header" />
        </ElegantHeader>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-sky-100/80 bg-white/85 backdrop-blur-md p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full lg:w-auto lg:flex-1">
            <button
              type="button"
              onClick={() => openModal('list')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <FolderSearch className="w-4 h-4" />
              Directorio de Pacientes
            </button>

            <button
              type="button"
              onClick={() => openModal('register')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              <UserPlus2 className="w-4 h-4" />
              Nuevo Paciente
            </button>

            <button
              type="button"
              onClick={() => openModal('medicalSchedules')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Clock3 className="w-4 h-4" />
              Horarios Médicos
            </button>

            <button
              type="button"
              onClick={() => openModal('consult')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-cyan-300 hover:text-cyan-700 hover:bg-cyan-50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <ClipboardList className="w-4 h-4" />
              Agenda Completa
            </button>
          </div>

          <button
            type="button"
            onClick={() => openModal('schedule')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-300/50 hover:shadow-xl hover:shadow-cyan-300/60 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 w-full lg:w-auto"
          >
            <Sparkles className="w-4 h-4" />
            Agendar Nueva Cita
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 items-start">
          {/* Area Principal 70% */}
          <section className="xl:col-span-7 rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 space-y-6">
            <div className="rounded-2xl border border-sky-100/70 bg-gradient-to-br from-white via-sky-50/40 to-blue-100/25 shadow-sm p-4 md:p-5 animate-in fade-in-50 duration-500">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-slate-900">Agenda de Hoy</h3>
                <button
                  type="button"
                  onClick={() => setActiveModal('consult')}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                >
                  Ver todas
                </button>
              </div>
              <TodayScheduleCard 
                items={todayAppointments}
                loading={loadingToday}
                error={todayError}
                onItemClick={openAppointmentDetail}
                onViewAll={() => setActiveModal('consult')}
              />
            </div>
          </section>

          {/* Barra Lateral 30% */}
          <aside className="xl:col-span-3 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] p-4 md:p-5">
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Utilidades rápidas
                </h4>
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setIsReportsOpen(true)}
                    className="w-full inline-flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-100 hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Centro de Reportes
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsReminderOpen(true)}
                    disabled={userRole !== 'admin'}
                    className={`w-full inline-flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                      userRole === 'admin'
                        ? 'border-amber-200 bg-amber-50/90 text-amber-800 hover:bg-amber-100 hover:border-amber-300 hover:-translate-y-0.5 duration-200'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Configuración de Recordatorios
                    </span>
                    {userRole === 'admin' ? <ChevronRight className="w-4 h-4" /> : 'Admin'}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-2 md:p-3">
                <div className="min-h-[360px] md:min-h-[420px]">
                  <RecentActivityCard />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <button
        type="button"
        onClick={() => openModal('schedule')}
        className="xl:hidden fixed bottom-6 right-6 z-40 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white shadow-xl shadow-cyan-300/60 hover:shadow-2xl active:scale-95 transition-all"
        aria-label="Iniciar Nueva Cita"
        title="Iniciar Nueva Cita"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Modals */}
      {activeModal === 'register' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] transform transition-all duration-300 animate-in fade-in zoom-in-95">
            <PatientRegistration onClose={closeModal} />
          </div>
        </div>
      )}

      {activeModal === 'list' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in fade-in zoom-in-95">
            <PatientList onClose={closeModal} />
          </div>
        </div>
      )}

      {activeModal === 'schedule' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
            <AppointmentForm onClose={closeModal} />
          </div>
        </div>
      )}

      {activeModal === 'consult' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[96vw] h-[94vh] overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
            <AppointmentsList onClose={closeModal} />
          </div>
        </div>
      )}

      {activeModal === 'medicalSchedules' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
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

      <ReportsHubModal isOpen={isReportsOpen} onClose={() => setIsReportsOpen(false)} />
      <NotificationRulesModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        userRole={userRole}
      />
    </div>
  );
}

// Header Component removed

