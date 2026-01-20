import React from 'react';
import { 
  Wallet, 
  CircleDollarSign
} from 'lucide-react';

export function formatDateTime(dt, timeOnly = false){
  if(!dt) return '---';
  try{
    const norm = typeof dt === 'string' && dt.includes(' ') && !dt.includes('T') ? dt.replace(' ', 'T') : dt;
    const d = new Date(norm);
    if(Number.isNaN(d.getTime())) return dt;
    if(timeOnly) return d.toLocaleTimeString('es-VE', {hour: '2-digit', minute:'2-digit'});
    return d.toLocaleString('es-VE', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' });
  }catch{ return dt; }
}

export function mapMovementType(t){
  const map = {
    payment_in: 'Ingreso',
    expense_out: 'Egreso',
    adjustment_in: 'Ajuste (+)',
    adjustment_out: 'Ajuste (-)',
    initial_balance: 'Apertura',
    reversal: 'Reverso de Operación'
  };
  return map[t] || t;
}

export function deriveSessionMetrics(session, movs){
  const openingBs = Number(session?.start_balance_bs ?? 0);
  const openingUsd = Number(session?.start_balance_usd ?? 0);

  const sums = (movs||[]).reduce((acc,m)=>{
    if(m?.movement_type === 'initial_balance') return acc;
    const isIncome = (m?.movement_type === 'payment_in' || m?.movement_type === 'adjustment_in');
    const isExpense = (m?.movement_type === 'expense_out' || m?.movement_type === 'adjustment_out');
    const sign = isIncome ? 1 : isExpense ? -1 : 0;
    
    // Check method: if not set, assume cash (legacy/standard movements). 
    // Digital movements explicitly have 'transfer_bs' or 'mobile_payment_bs'.
    const method = m?.method || 'cash';
    const isDigital = ['transfer_bs', 'mobile_payment_bs'].includes(method);
    const amt = Number(m.amount || 0);

    if(m?.currency === 'BS') {
       acc.bs += sign * amt;
       if(isDigital) acc.digitalBs += sign * amt;
       else acc.cashBs += sign * amt;
    }
    if(m?.currency === 'USD') {
       acc.usd += sign * amt;
       // USD usually physical, but if we add Zelle later, logic is ready
       if(isDigital) acc.digitalUsd += sign * amt; 
       else acc.cashUsd += sign * amt;
    }
    return acc;
  },{ bs:0, usd:0, cashBs:0, cashUsd:0, digitalBs:0, digitalUsd:0 });

  return { 
    openingBs, 
    openingUsd, 
    sumBs: sums.bs, 
    sumUsd: sums.usd, 
    
    // Totals
    balanceBs: openingBs + sums.bs, 
    balanceUsd: openingUsd + sums.usd,

    // Breakdowns
    balanceCashBs: openingBs + sums.cashBs,
    balanceCashUsd: openingUsd + sums.cashUsd,
    
    sumDigitalBs: sums.digitalBs,
    sumDigitalUsd: sums.digitalUsd
  };
}

export function ActivityIcon(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  )
}
