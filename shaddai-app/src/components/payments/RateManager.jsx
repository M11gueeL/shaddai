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
    <div className="p-4 sm:p-6">
      {/* Encabezado compacto con acento */}
      <div className="flex items-start gap-3">
        <span className="inline-block w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 via-sky-500 to-cyan-400" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900 leading-none">Tasa del día</h2>
          <p className="text-sm text-gray-600 mt-1">Registra o consulta la tasa BCV para habilitar cuentas y pagos.</p>
        </div>
      </div>

      {/* Dos columnas: estado actual y actualización */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estado actual */}
        <div className="md:col-span-2 relative rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-5 shadow-sm">
          {loading ? (
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-sky-50 rounded-xl grid place-content-center text-lg">💱</div>
                <div>
                  <div className="text-3xl font-bold tracking-tight text-gray-900">{rate ? Number(rate.rate_bcv).toFixed(2) : '--'} <span className="text-base font-semibold text-gray-600">Bs/USD</span></div>
                  <div className="text-xs text-gray-500 mt-1">{rate ? `Fecha: ${rate.rate_date}` : 'Sin tasa para hoy'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rate && <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">Registrada</span>}
                <button onClick={load} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white hover:bg-gray-50">Refrescar</button>
              </div>
            </div>
          )}
        </div>

        {/* Actualización / registro */}
        {hasRole?.(['admin']) && (
          <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-5 shadow-sm">
            <div className="text-sm font-medium text-gray-900">{rate ? 'Actualizar tasa' : 'Registrar tasa'}</div>
            <form onSubmit={submit} className="mt-3 space-y-3">
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder={rate ? `Actual: ${Number(rate.rate_bcv).toFixed(2)}` : 'Ej: 40.50'}
                value={value}
                onChange={(e)=>setValue(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setValue('')} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white hover:bg-gray-50">Limpiar</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm">{rate ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
            <p className="mt-2 text-xs text-gray-500">La tasa afecta conversiones Bs/USD en cuentas y pagos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
