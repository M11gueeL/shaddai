import React from 'react';
import { DollarSign, FileText, User } from 'lucide-react';

export default function BadgeType({ type, method }) {
    if (type === 'payment') {
         const methodMap = {
             'cash': 'Efectivo',
             'transfer_bs': 'Transf. BS',
             'mobile_payment_bs': 'Pago Móvil',
             'zelle': 'Zelle',
             'transfer_usd': 'Transf. USD',
             'card': 'Tarjeta'
         };
         return (
             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                 <DollarSign className="w-3 h-3" />
                 Pago ({methodMap[method] || method})
             </span>
         );
    }
    if (type === 'receipt') {
        return (
             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                 <FileText className="w-3 h-3" />
                 Recibo
             </span>
        );
    }
    if (type === 'account') {
        return (
             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                 <User className="w-3 h-3" />
                 Cuenta
             </span>
        );
    }
    return null;
};
