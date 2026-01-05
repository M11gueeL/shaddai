import React, { useEffect, useState } from 'react';
import * as ratesApi from '../../api/rates';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  TrendingUp, 
  RotateCw, 
  CheckCircle2, 
  DollarSign,
  Calendar
} from 'lucide-react';

export default function RateManager(){
  const { token, hasRole } = useAuth();
  const toast = useToast();
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const load = async()=>{
    try{ setLoading(true); const r = await ratesApi.getTodayRate(token); setRate(r.data); }
    catch(e){ setRate(null); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const submit = async(e)=>{
    e.preventDefault();
    const v = parseFloat(value);
    if(!v || v<=0) return toast.warning('Monto inválido');
    try{
      await ratesApi.createRate({ rate_bcv: v }, token);
      toast.success('Tasa registrada exitosamente');
      setValue('');
      load();
    }catch(e){ toast.error(e?.response?.data?.error || 'No se pudo registrar'); }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasa de Cambio</h2>
          <p className="text-gray-500">Gestión del valor BCV para conversiones automáticas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                <Calendar className="w-3 h-3" />
                {rate ? 'Hoy' : 'Pendiente'}
              </span>
              <button 
                onClick={load} 
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Refrescar"
              >
                <RotateCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="mb-2 text-sm font-medium text-gray-500 uppercase tracking-widest">Valor Actual</div>
            
            {loading ? (
              <div className="h-16 w-48 bg-gray-100 rounded-2xl animate-pulse" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {rate ? Number(rate.rate_bcv).toFixed(2) : '--.--'}
                </span>
                <span className="text-xl font-medium text-gray-400">Bs/USD</span>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${rate ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-sm font-medium text-gray-600">
                {rate 
                  ? `Registrada a las ${new Date(rate.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
                  : 'Se requiere actualización diaria'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Update Form */}
        {hasRole?.(['admin', 'recepcionista']) && (
          <div className="flex flex-col justify-center">
            <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Nueva Actualización</h3>
              
              <form onSubmit={submit} className="space-y-6">
                <div className={`
                  group relative flex items-center bg-gray-50 rounded-2xl border-2 transition-all duration-300
                  ${focused ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-500/10' : 'border-transparent hover:bg-gray-100'}
                `}>
                  <div className="pl-5 text-gray-400 group-hover:text-gray-600 transition-colors">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full bg-transparent border-none p-5 text-2xl font-bold text-gray-900 placeholder-gray-300 focus:ring-0 outline-none"
                    value={value}
                    onChange={(e)=>setValue(e.target.value)}
                    onFocus={()=>setFocused(true)}
                    onBlur={()=>setFocused(false)}
                  />
                  <div className="pr-6 text-sm font-bold text-gray-400">Bs</div>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={()=>setValue('')} 
                    className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Limpiar
                  </button>
                  <button 
                    type="submit" 
                    disabled={!value}
                    className="flex-[2] px-4 py-3.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-900/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {rate ? 'Actualizar Tasa' : 'Registrar Valor'}
                  </button>
                </div>
              </form>
              
              <div className="mt-6 flex gap-3 text-xs text-gray-400 bg-gray-50 p-4 rounded-xl">
                <div className="min-w-[4px] bg-indigo-500 rounded-full" />
                <p>Las actualizaciones de tasa se reflejan inmediatamente en todas las cuentas abiertas y nuevos presupuestos.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
