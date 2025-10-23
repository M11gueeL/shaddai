import { useState, useEffect } from 'react';
import PatientRegistration from './PatientRegistration';
import PatientList from './PatientsList';

export default function ReceptionPanel() {
  const [activeModal, setActiveModal] = useState(null); // 'register', 'list', null

  // Efecto para controlar el scroll del body
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <Header />
        <ButtonGrid onButtonClick={openModal} />
      </div>

      {/* Modal de Registro de Paciente */}
      {activeModal === 'register' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] transform transition-all duration-300 scale-95">
            <PatientRegistration onClose={closeModal} />
            </div>
        </div>
        )}

        {activeModal === 'list' && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95">
            <PatientList onClose={closeModal} />
            </div>
        </div>
        )}
    </div>
  );
}

function ButtonGrid({ onButtonClick }) {
  const buttons = [
    {
      id: 'register',
      title: "Registrar Paciente",
      description: "Agregar nuevo paciente al sistema",
      icon: "👥",
      color: "from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700"
    },
    {
      id: 'list',
      title: "Ver Pacientes",
      description: "Consultar listado de pacientes",
      icon: "📋",
      color: "from-blue-500 to-cyan-600",
      hoverColor: "hover:from-blue-600 hover:to-cyan-700"
    },
    {
      id: 'schedule',
      title: "Agendar Cita",
      description: "Programar nueva cita médica",
      icon: "📅",
      color: "from-purple-500 to-indigo-600",
      hoverColor: "hover:from-purple-600 hover:to-indigo-700"
    },
    {
      id: 'consult',
      title: "Consultar Citas",
      description: "Revisar agenda de citas",
      icon: "🔍",
      color: "from-orange-500 to-amber-600",
      hoverColor: "hover:from-orange-600 hover:to-amber-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {buttons.map((button) => (
        <ActionButton
          key={button.id}
          title={button.title}
          description={button.description}
          icon={button.icon}
          color={button.color}
          hoverColor={button.hoverColor}
          onClick={() => onButtonClick(button.id)}
        />
      ))}
    </div>
  );
}

function ActionButton({ title, description, icon, color, hoverColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full h-48 rounded-2xl shadow-lg
        bg-gradient-to-r ${color} ${hoverColor}
        transition-all duration-300 transform hover:scale-105
        text-white p-6 flex flex-col justify-between
        hover:shadow-xl
      `}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <div className="text-left">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-blue-100 text-sm opacity-90">{description}</p>
      </div>
    </button>
  );
}

function Header() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
        Menú de Recepción
      </h1>
      <p className="text-xl text-gray-600">
        Gestión de pacientes y citas médicas
      </p>
    </div>
  );
}