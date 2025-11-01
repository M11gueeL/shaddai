import React, { useEffect, useState } from 'react';
import * as ratesApi from '../../api/rates';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RateManager(){
  const { token, hasRole } = useAuth();
  const toast = useToast();
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState('');

  const load = async()=>{
    try{ setLoading(true); const r = await ratesApi.getTodayRate(token); setRate(r.data); }
    catch(e){ setRate(null); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);

  const submit = async(e)=>{
    e.preventDefault();
    const v = parseFloat(value);
    if(!v || v<=0) return toast.warning('Monto inválido');
    try{
      await ratesApi.createRate({ rate_bcv: v }, token);
      toast.success('Tasa registrada');
      setValue('');
      load();
    }catch(e){ toast.error(e?.response?.data?.error || 'No se pudo registrar'); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-900">Tasa del día</h2>
      <p className="text-sm text-gray-600">Registra o consulta la tasa BCV para habilitar cuentas y pagos.</p>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        {loading ? (
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
        ) : rate ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{Number(rate.rate_bcv).toFixed(2)} Bs/USD</div>
              <div className="text-xs text-gray-500">Fecha: {rate.rate_date}</div>
            </div>
            <span className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700">Registrada</span>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Ej: 40.50"
              value={value}
              onChange={(e)=>setValue(e.target.value)}
            />
            <div className="flex justify-end">
              <button className="px-4 py-2 rounded-lg bg-gray-900 text-white">Registrar tasa</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
