import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PaymentPanel() {
  const { hasRole } = useAuth();

  return (
    <div className="flex flex-col items-center py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Sistema de Pagos</h1>
      
      <div className="flex space-x-4 mb-8">
        <NavLink 
          to="/payment" 
          end
          className={({ isActive }) => 
            `px-6 py-3 rounded-lg font-medium transition-colors ${
              isActive 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`
          }
        >
          Operaciones
        </NavLink>
        
        {hasRole(['admin']) && (
          <NavLink 
            to="/payment/audit" 
            className={({ isActive }) => 
              `px-6 py-3 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`
            }
          >
            Auditoría
          </NavLink>
        )}
      </div>
      
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6">
        <Outlet />
      </div>
    </div>
  );
}