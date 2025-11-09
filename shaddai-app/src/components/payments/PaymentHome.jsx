import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ratesApi from '../../api/rates';
import * as cashApi from '../../api/cashregister';
import { useAuth } from '../../context/AuthContext';

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

  const rateText = rate ? `Hoy ${Number(rate.rate_bcv).toFixed(2)} Bs/USD` : 'Sin tasa registrada';
  const cashOpen = cash?.status === 'open';

  return (
    <div className="p-4 sm:p-6">
      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard
          tone="sky"
          icon={<span>💱</span>}
          title="Tasa del día"
          description={rateText}
          action={{ label: rate ? 'Gestionar tasa' : 'Registrar tasa', onClick: ()=>navigate('/payment/rate') }}
        />
        <FeatureCard
          tone={cashOpen ? 'emerald' : 'amber'}
          icon={<span>🧾</span>}
          title="Caja"
          statusPill={cashOpen ? 'Abierta' : 'Cerrada'}
          description={cashOpen ? 'Sesión de caja abierta' : 'No hay sesión abierta'}
          action={{ label: cashOpen ? 'Gestionar caja' : 'Abrir caja', onClick: ()=>navigate('/payment/cash') }}
        />
        <FeatureCard
          tone="indigo"
          icon={<span>💳</span>}
          title="Cuentas y pagos"
          description="Crea cuentas, agrega servicios y registra pagos"
          action={{ label: 'Ir a cuentas', onClick: ()=>navigate('/payment/accounts') }}
        />
      </div>

      {/* Atajos rápidos */}
      <div className="mt-6">
        <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-3 flex flex-wrap gap-2">
          <QuickAction label="Abrir caja" onClick={()=>navigate('/payment/cash')} icon={<span>⚡</span>} />
          <QuickAction label="Registrar tasa" onClick={()=>navigate('/payment/rate')} icon={<span>📈</span>} />
          <QuickAction label="Nueva cuenta" onClick={()=>navigate('/payment/accounts')} icon={<span>➕</span>} />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ tone='sky', icon, title, description, action, statusPill }){
  const colorMap = {
    sky:   { ring: 'ring-sky-200',   dot: 'from-sky-500 to-cyan-400',    iconBg: 'bg-sky-50',    text: 'text-sky-700' },
    emerald:{ ring: 'ring-emerald-200', dot: 'from-emerald-500 to-teal-400', iconBg: 'bg-emerald-50', text: 'text-emerald-700' },
    amber: { ring: 'ring-amber-200', dot: 'from-amber-500 to-orange-400',  iconBg: 'bg-amber-50', text: 'text-amber-700' },
    indigo:{ ring: 'ring-indigo-200', dot: 'from-indigo-500 to-violet-500', iconBg: 'bg-indigo-50', text: 'text-indigo-700' },
  };
  const c = colorMap[tone] || colorMap.sky;
  return (
    <div className={`relative rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-5 shadow-sm ring-1 ${c.ring}`}>
      <span className={`absolute left-0 top-5 h-8 w-1.5 rounded-full bg-gradient-to-b ${c.dot}`} />
      <div className="pl-4 flex items-start gap-3">
        <div className={`h-10 w-10 ${c.iconBg} rounded-xl grid place-content-center text-lg`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold text-gray-900">{title}</div>
            {statusPill && (<span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-900 text-white">{statusPill}</span>)}
          </div>
          <div className="text-sm text-gray-700 mt-0.5 truncate" title={typeof description==='string'?description:undefined}>{description}</div>
          <div className="mt-3">
            <button onClick={action?.onClick} className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:shadow">{action?.label}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ label, onClick, icon }){
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm">
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
