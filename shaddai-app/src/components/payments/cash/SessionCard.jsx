import React from 'react';
import { User, Clock, Lock, Unlock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDateTime } from './utils';

export default function SessionCard({ status, session, loading, user, openingUsd, setOpeningUsd, openingBs, setOpeningBs, submitOpen, closeSession }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/50">
      <div className={`absolute inset-0 opacity-10 ${status === 'open' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
      
      <div className="relative p-6">
        <div className="flex justify-between items-start mb-6">
          <StatusBadge status={status} />
          {status === 'open' ? (
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          ) : (
             <div className="w-2 h-2 rounded-full bg-gray-300" />
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
             <div className="space-y-3 animate-pulse">
               <div className="h-4 bg-gray-100 rounded w-1/2" />
               <div className="h-8 bg-gray-100 rounded w-3/4" />
               <div className="h-4 bg-gray-100 rounded w-1/3" />
             </div>
          ) : (
             <>
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/50 backdrop-blur rounded-lg">
                   <User className="w-5 h-5 text-gray-700" />
                 </div>
                 <div>
                   <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Responsable</div>
                   <div className="font-semibold text-gray-900 truncate max-w-[200px]">
                     {status === 'open' 
                       ? [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email 
                       : '---'
                     }
                   </div>
                 </div>
               </div>

               <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/50 backdrop-blur rounded-lg">
                   <Clock className="w-5 h-5 text-gray-700" />
                 </div>
                 <div>
                   <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Apertura</div>
                   <div className="font-semibold text-gray-900">
                     {formatDateTime(session?.opened_at || session?.start_time)}
                   </div>
                 </div>
               </div>
             </>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100/50">
           {status !== 'open' ? (
             <div className="space-y-4">
               <p className="text-sm text-gray-500">Inicia una nueva sesión para comenzar a registrar operaciones.</p>
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-gray-400">USD Inicial</label>
                   <input 
                     type="number" 
                     placeholder="0.00" 
                     value={openingUsd} 
                     onChange={(e)=>setOpeningUsd(e.target.value)}
                     className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-gray-400">Bs Inicial</label>
                   <input 
                     type="number" 
                     placeholder="0.00" 
                     value={openingBs} 
                     onChange={(e)=>setOpeningBs(e.target.value)}
                     className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                   />
                 </div>
               </div>

               <button 
                 onClick={submitOpen}
                 className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium shadow-lg shadow-gray-900/10 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
               >
                 <Unlock className="w-4 h-4" />
                 Abrir Caja
               </button>
             </div>
           ) : (
             <button 
               onClick={closeSession}
               className="w-full py-3 bg-white border border-gray-200 text-red-600 rounded-xl font-medium hover:bg-red-50 hover:border-red-100 transition-all flex justify-center items-center gap-2"
             >
               <Lock className="w-4 h-4" />
               Cerrar Turno
             </button>
           )}
        </div>
      </div>
    </div>
  );
}
