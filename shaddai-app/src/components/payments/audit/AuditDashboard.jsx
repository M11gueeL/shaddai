import React, { useEffect, useState } from 'react';
import { AlertCircle, DollarSign, Activity, Clock, History, CheckCircle2, CreditCard, User } from 'lucide-react';
import * as paymentsApi from '../../../api/payments';
import * as cashApi from '../../../api/cashregister';
import { useAuth } from '../../../context/AuthContext';
import SessionDetailModal from './SessionDetailModal';

function StatCard({ label, value, icon: Icon, color, desc }) {
  const colors = {
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-start justify-between hover:-translate-y-1 transition-transform duration-300">
       <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          {desc && <p className="text-xs text-gray-500 font-medium">{desc}</p>}
       </div>
       <div className={`p-3 rounded-2xl ${colors[color] || 'bg-gray-50 text-gray-600'} shadow-sm`}>
          <Icon className="w-6 h-6" />
       </div>
    </div>
  );
}

export default function AuditDashboard({ navigateTo }) {
  const { token } = useAuth();
  const [pending, setPending] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  
  useEffect(() => {
    (async () => {
      try { const p = await paymentsApi.listPendingPayments(token); setPending(p.data || []); } catch {}
      try { const s = await cashApi.adminListSessions(token); setSessions(s.data || []); } catch {}
    })();
  }, [token]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const sessionsToday = sessions.filter(s => (s.start_time || s.opened_at || '').startsWith(todayIso)).length;
  const pendingUsd = pending.reduce((acc, p) => acc + Number(p.amount_usd_equivalent || 0), 0);

  const formatDateTime = (dt) => {
    if (!dt) return '-';
    const norm = typeof dt === 'string' && dt.includes(' ') && !dt.includes('T') ? dt.replace(' ', 'T') : dt;
    const d = new Date(norm);
    if (Number.isNaN(d.getTime())) return dt;
    return d.toLocaleString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const mapMethod = (m) => {
    const map = {
      cash_usd: 'Divisas en Efectivo',
      cash_bs: 'Bolívares en Efectivo',
      transfer_bs: 'Transferencia',
      mobile_payment_bs: 'Pago Móvil'
    }; 
    return map[m] || m;
  };

  const formatUser = (s) => {
    const fn = s.first_name || s.firstName || ''; 
    const ln = s.last_name || s.lastName || '';
    const full = [fn, ln].filter(Boolean).join(' ');
    return full || `Usuario ${s.user_id}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {selectedSessionId && (
        <SessionDetailModal 
          sessionId={selectedSessionId} 
          onClose={() => setSelectedSessionId(null)} 
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Pagos por Verificar" 
          value={pending.length} 
          icon={AlertCircle} 
          color="amber" 
          desc="Requieren acción inmediata"
        />
        <StatCard 
          label="Monto Pendiente USD" 
          value={`$${pendingUsd.toFixed(2)}`} 
          icon={DollarSign} 
          color="indigo" 
          desc="En transacciones por aprobar"
        />
        <StatCard 
          label="Cajas Abiertas Hoy" 
          value={sessionsToday} 
          icon={Activity} 
          color="emerald" 
          desc="Sesiones activas en sistema"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Últimos Pagos Pendientes
            </h3>
            <button onClick={() => navigateTo('payments')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Ver todos</button>
          </div>
          
          <div className="space-y-3">
            {pending.length === 0 ? (
               <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No hay pagos pendientes
               </div>
            ) : pending.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50/50 rounded-2xl transition-colors group cursor-pointer" onClick={() => navigateTo('payments')}>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm">
                       <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                       <div className="font-bold text-gray-900 flex items-center gap-2">
                          {p.currency} {Number(p.amount).toFixed(2)}
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Pendiente</span>
                       </div>
                       <div className="text-xs text-gray-500">
                          {mapMethod(p.payment_method)} • Cuenta #{p.account_id}
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs font-bold text-gray-900">~${Number(p.amount_usd_equivalent).toFixed(2)}</div>
                    <div className="text-[10px] text-gray-400">{formatDateTime(p.payment_date)}</div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" /> Sesiones Recientes
            </h3>
            <button onClick={() => navigateTo('sessions')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Ver todas</button>
          </div>

          <div className="space-y-3">
             {sessions.length === 0 ? (
               <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No hay actividad de sesiones
               </div>
            ) : sessions.slice(0, 5).map(s => (
              <div 
                key={s.id} 
                onClick={() => setSelectedSessionId(s.id)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-gray-100"
              >
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shadow-sm ${s.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-400 mobile-hidden'}`}>
                       <User className="w-5 h-5" />
                    </div>
                    <div>
                       <div className="font-bold text-gray-900">{formatUser(s)}</div>
                       <div className="text-xs text-gray-500">
                          Inició: {formatDateTime(s.start_time || s.opened_at)}
                       </div>
                    </div>
                 </div>
                 <div className={`text-xs font-bold px-2 py-1 rounded-lg ${s.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                    {s.status === 'open' ? 'ABIERTA' : 'CERRADA'}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
