import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Package, 
  History, 
  LayoutDashboard,
  FileText 
} from 'lucide-react';
import AuditDashboard from './AuditDashboard';
import PendingPayments from './PendingPayments';
import ServicesManager from './ServicesManager';
import SessionsAdmin from './SessionsAdmin';
import ReceiptsAdmin from './ReceiptsAdmin';

export default function PaymentAudit() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Auditoría y Control
          </h2>
          <p className="text-gray-500 mt-1">Gestión administrativa, verificación de pagos y control de servicios</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
          <NavTab active={tab === 'dashboard'} onClick={() => setTab('dashboard')} icon={LayoutDashboard} label="Resumen" />
          <NavTab active={tab === 'payments'} onClick={() => setTab('payments')} icon={CreditCard} label="Pagos" count={null} />
          <NavTab active={tab === 'receipts'} onClick={() => setTab('receipts')} icon={FileText} label="Recibos" />
          <NavTab active={tab === 'services'} onClick={() => setTab('services')} icon={Package} label="Servicios" />
          <NavTab active={tab === 'sessions'} onClick={() => setTab('sessions')} icon={History} label="Cajas" />
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {tab === 'dashboard' && <AuditDashboard navigateTo={setTab} />}
        {tab === 'payments' && <PendingPayments />}
        {tab === 'receipts' && <ReceiptsAdmin />}
        {tab === 'services' && <ServicesManager />}
        {tab === 'sessions' && <SessionsAdmin />}
      </div>
    </div>
  );
}

function NavTab({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
        ${active 
          ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
      `}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
      {label}
      {count !== null && count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}
