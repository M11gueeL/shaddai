import React from 'react';
import { Wallet, CircleDollarSign } from 'lucide-react';
import { deriveSessionMetrics, ActivityIcon } from './utils';

export default function SummaryCards({ session, movs }){
  const d = deriveSessionMetrics(session, movs);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <StatBox label="Fondo Inicial" valueBs={d.openingBs} valueUsd={d.openingUsd} icon={Wallet} tone="gray" />
      <StatBox label="Actividad Neta" valueBs={d.sumBs} valueUsd={d.sumUsd} icon={ActivityIcon} tone="blue" />
      <StatBox label="Saldo en Caja" valueBs={d.balanceBs} valueUsd={d.balanceUsd} icon={CircleDollarSign} tone="emerald" highlight />
    </div>
  );
}

function StatBox({ label, valueBs, valueUsd, icon: Icon, tone, highlight }){
  const tones = {
    gray: 'bg-gray-50 text-gray-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };
  const t = tones[tone] || tones.gray;

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 ${highlight ? 'bg-gray-900 border-gray-900 text-white shadow-lg transform hover:-translate-y-1' : 'bg-white border-gray-100 text-gray-900 hover:shadow-md'}`}>
      <div className="flex items-center gap-2 mb-3 opacity-80">
        <Icon className={`w-4 h-4 ${highlight ? 'text-white' : ''}`} />
        <span className="text-xs font-semibold uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="space-y-1">
        <div className={`text-lg font-bold truncate ${highlight ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xs font-normal opacity-60 mr-1">Bs</span>
          {valueBs.toFixed(2)}
        </div>
        <div className={`text-sm font-medium truncate ${highlight ? 'text-white/80' : 'text-gray-500'}`}>
          <span className="text-xs font-normal opacity-60 mr-1">USD</span>
          {valueUsd.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
