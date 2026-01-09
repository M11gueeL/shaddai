import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import ElegantHeader from '../../common/ElegantHeader';
import { 
  CreditCard, 
  TrendingUp, 
  Wallet, 
  Users, 
  ShieldCheck,
  LayoutDashboard,
  FileBarChart
} from 'lucide-react';

export default function PaymentPanel() {
  const { hasRole } = useAuth();

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50/50 overflow-x-hidden transition-colors duration-500">
      <div className="px-4 sm:px-8 pt-6 pb-2">
        <ElegantHeader 
            icon={CreditCard}
            sectionName="Finanzas"
            title="Panel de"
            highlightText="Pagos"
            description="Control centralizado de caja, tasas de cambio y gestión de cuentas por cobrar."
        />
      </div>

      <div className="px-4 sm:px-8 mt-2 flex-1 flex flex-col">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col flex-1">
          <div className="border-b border-gray-100 bg-white sticky top-0 z-20 px-4 pt-4">
            <nav className="flex gap-2 overflow-x-auto pb-4 w-full no-scrollbar items-center">
              <Tab to="/payment" end label="Inicio" icon={LayoutDashboard} />
              <Tab to="/payment/rate" label="Tasa del Día" icon={TrendingUp} />
              <Tab to="/payment/cash" label="Caja Chica" icon={Wallet} />
              <Tab to="/payment/accounts" label="Cuentas" icon={Users} />
              {hasRole(['admin']) && (
                <>
                  <div className="w-px h-6 bg-gray-200 mx-1 shrink-0" />
                  <Tab to="/payment/reports" label="Reportes" icon={FileBarChart} />
                  <Tab to="/payment/audit" label="Auditoría" icon={ShieldCheck} />
                </>
              )}
            </nav>
          </div>
          
          <div className="flex-1 bg-gray-50/30 p-4 sm:p-6 relative">
            <div className="absolute inset-0 bg-grid-slate-50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

function Tab({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `
        group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out border whitespace-nowrap shrink-0
        ${isActive 
          ? 'bg-gray-900 text-white border-gray-900 shadow-md shadow-gray-900/20 translate-y-0' 
          : 'bg-white text-gray-500 border-transparent hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 text-gray-400 group-hover:text-gray-600'}`} />
          <span>{label}</span>
          {isActive && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/20 rounded-full" />
          )}
        </>
      )}
    </NavLink>
  );
}
