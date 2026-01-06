import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';
import { formatDateTime, mapMovementType } from './utils';

export default function MovementItem({ movement }){
  const isPositive = ['payment_in', 'adjustment_in', 'initial_balance'].includes(movement.movement_type);
  const isNeutral = movement.movement_type === 'initial_balance';
  
  const Icon = isNeutral ? Info : (isPositive ? ArrowDownCircle : ArrowUpCircle); 
  
  const colors = {
    payment_in: 'text-emerald-500 bg-emerald-50',
    expense_out: 'text-rose-500 bg-rose-50',
    adjustment_in: 'text-indigo-500 bg-indigo-50',
    adjustment_out: 'text-orange-500 bg-orange-50',
    initial_balance: 'text-sky-500 bg-sky-50'
  };
  const c = colors[movement.movement_type] || 'text-gray-500 bg-gray-50';

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
      <div className={`p-3 rounded-full ${c} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-gray-900 text-sm truncate pr-2">{movement.movement_type === 'payment_in' ? 'Pago Recibido' : mapMovementType(movement.movement_type)}</h4>
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
            {formatDateTime(movement.created_at, true)}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">{movement.description || 'Sin descripción'}</p>
      </div>

      <div className="text-right shrink-0">
        <div className={`font-bold text-sm ${isPositive ? 'text-emerald-600' : 'text-gray-900'}`}>
          {isPositive ? '+' : '-'} {Number(movement.amount).toFixed(2)} <span className="text-[10px] text-gray-400 font-normal">{movement.currency}</span>
        </div>
      </div>
    </div>
  );
}
