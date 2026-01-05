import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ratesApi from '../../api/rates';
import * as cashApi from '../../api/cashregister';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Plus, 
  ArrowRight,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function PaymentHome(){
  const { token } = useAuth();
  const [rate, setRate] = useState(null);
  const [cash, setCash] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    (async()=>{
      try { const r = await ratesApi.getTodayRate(token); setRate(r.data); } catch(e){ setRate(null); }
      try { const s = await cashApi.getStatus(token); setCash(s.data); } catch(e){ setCash(null); }
    })();
  },[token]);

  const rateValue = rate ? Number(rate.rate_bcv).toFixed(2) : '--';
  const cashOpen = cash?.status === 'open';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tasa del Día"
          value={`${rateValue} Bs`}
          subtitle={rate ? `Actualizado: ${rate.rate_date}` : 'Sin tasa registrada'}
          icon={TrendingUp}
          color="indigo"
          action={{ label: rate ? 'Ver Historial' : 'Registrar', onClick: () => navigate('/payment/rate') }}
          alert={!rate}
        />
        
        <StatCard
          title="Estado de Caja"
          value={cashOpen ? 'Abierta' : 'Cerrada'}
          subtitle={cashOpen ? 'Sesión activa' : 'Requiere apertura'}
          icon={Wallet}
          color={cashOpen ? 'emerald' : 'rose'}
          action={{ label: cashOpen ? 'Gestionar' : 'Abrir Turno', onClick: () => navigate('/payment/cash') }}
        />

        <StatCard
          title="Gestión de Cuentas"
          value="Pagos"
          subtitle="Cobros y facturación"
          icon={CreditCard}
          color="sky"
          action={{ label: 'Ir a Cuentas', onClick: () => navigate('/payment/accounts') }}
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-gray-900" />
          Acciones Rápidas
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionTile 
            title="Abrir Caja" 
            desc="Iniciar sesión de cobro"
            icon={Wallet} 
            onClick={()=>navigate('/payment/cash')} 
            delay={100}
          />
          <ActionTile 
            title="Registrar Tasa" 
            desc="Actualizar valor del dólar"
            icon={TrendingUp} 
            onClick={()=>navigate('/payment/rate')} 
            delay={200}
          />
          <ActionTile 
            title="Nueva Cuenta" 
            desc="Crear cuenta para paciente"
            icon={Plus} 
            onClick={()=>navigate('/payment/accounts')} 
            variant="primary"
            delay={300}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, action, alert }) {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100 group-hover:ring-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100 group-hover:ring-emerald-200',
    rose: 'bg-rose-50 text-rose-600 ring-rose-100 group-hover:ring-rose-200',
    sky: 'bg-sky-50 text-sky-600 ring-sky-100 group-hover:ring-sky-200',
  };
  
  const c = colorStyles[color] || colorStyles.indigo;

  return (
    <div className={`
      relative group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm 
      hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300
    `}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${c} transition-colors`}>
          <Icon className="w-6 h-6" />
        </div>
        {alert && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
            <AlertCircle className="w-3 h-3" />
            Requerido
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
        <p className="text-sm text-gray-400 font-medium">{subtitle}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50">
        <button 
          onClick={action.onClick}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 hover:text-indigo-600 group-hover:px-2 transition-all"
        >
          {action.label}
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
        </button>
      </div>
    </div>
  );
}

function ActionTile({ title, desc, icon: Icon, onClick, variant = 'default', delay = 0 }) {
  const isPrimary = variant === 'primary';
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group text-left
        ${isPrimary 
          ? 'bg-gray-900 border-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20' 
          : 'bg-white border-gray-100 text-gray-900 hover:border-gray-300 hover:shadow-md'
        }
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`
        p-3 rounded-xl transition-transform duration-300 group-hover:scale-110
        ${isPrimary ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-600 group-hover:bg-gray-100'}
      `}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className={`text-xs mt-0.5 ${isPrimary ? 'text-gray-300' : 'text-gray-500'}`}>{desc}</div>
      </div>
      <div className={`ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${isPrimary ? 'text-white' : 'text-gray-400'}`}>
        <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  );
}
