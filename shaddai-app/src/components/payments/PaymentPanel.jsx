import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PaymentPanel() {
  const { hasRole } = useAuth();

  return (
    <div className="flex flex-col w-full">
      <div className="px-6 pt-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Caja y Pagos</h1>
        <p className="text-gray-600 mt-1">Gestiona sesiones de caja, cuentas, servicios, tasas y pagos.</p>
      </div>

      <div className="px-4 sm:px-6 mt-6">
        <div className="bg-white/70 backdrop-blur rounded-2xl border border-gray-200">
          <nav className="flex gap-2 p-2">
            <Tab to="/payment" end label="Inicio" icon={<span>🏠</span>} />
            <Tab to="/payment/rate" label="Tasa" icon={<span>💱</span>} />
            <Tab to="/payment/cash" label="Caja" icon={<span>🧾</span>} />
            <Tab to="/payment/accounts" label="Cuentas" icon={<span>💳</span>} />
            {hasRole(['admin']) && <Tab to="/payment/audit" label="Auditoría" icon={<span>🛡️</span>} />}
          </nav>
          <div className="border-t border-gray-100">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

function Tab({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => [
        'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
        isActive
          ? 'bg-gray-900 text-white shadow'
          : 'text-gray-700 hover:bg-gray-100',
      ].join(' ')}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </NavLink>
  );
}