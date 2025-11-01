import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ratesApi from '../../api/rates';
import * as cashApi from '../../api/cashregister';
import { useAuth } from '../../context/AuthContext';

export default function PaymentHome(){
  const { token, hasRole } = useAuth();
  const [rate, setRate] = useState(null);
  const [cash, setCash] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    (async()=>{
      try { const r = await ratesApi.getTodayRate(token); setRate(r.data); } catch(e){ setRate(null); }
      try { const s = await cashApi.getStatus(token); setCash(s.data); } catch(e){ setCash(null); }
    })();
  },[token]);

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          title="Tasa del día"
          description={rate ? `Hoy: ${Number(rate.rate_bcv).toFixed(2)} Bs/USD` : 'Aún no hay tasa registrada para hoy.'}
          status={rate ? 'ok' : 'warn'}
          actionLabel={rate ? 'Gestionar tasa' : 'Registrar tasa'}
          onAction={()=>navigate('/payment/rate')}
        />
        <InfoCard
          title="Caja"
          description={cash?.status==='open' ? `Sesión abierta (Usuario ${cash?.session?.user_id})` : 'No hay sesión de caja abierta.'}
          status={cash?.status==='open' ? 'ok' : 'warn'}
          actionLabel={cash?.status==='open' ? 'Gestionar caja' : 'Abrir caja'}
          onAction={()=>navigate('/payment/cash')}
        />
      </div>

      <div className="mt-6">
        <InfoCard
          title="Cuentas y Pagos"
          description="Crea cuentas, agrega servicios y registra pagos de manera sencilla."
          status="neutral"
          actionLabel="Ir a cuentas"
          onAction={()=>navigate('/payment/accounts')}
        />
      </div>
    </div>
  );
}

function InfoCard({ title, description, status='neutral', actionLabel, onAction }){
  const tones = status==='ok' ? 'bg-emerald-50 border-emerald-200' : status==='warn' ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200';
  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${tones}`}>
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <div className="text-sm text-gray-700 mt-1">{description}</div>
      <div className="mt-3">
        <button onClick={onAction} className="px-4 py-2 rounded-lg bg-gray-900 text-white">{actionLabel}</button>
      </div>
    </div>
  );
}
