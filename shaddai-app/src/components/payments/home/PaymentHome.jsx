import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ratesApi from '../../../api/rates';
import * as cashApi from '../../../api/cashregister';
import { useAuth } from '../../../context/AuthContext';
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Plus
} from 'lucide-react';
import StatCard from './StatCard';
import ActionTile from './ActionTile';

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
