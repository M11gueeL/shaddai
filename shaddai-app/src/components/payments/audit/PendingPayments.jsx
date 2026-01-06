import React, { useEffect, useState, useMemo } from 'react';
import { 
  CreditCard, Search, CheckCircle2, AlertCircle, History 
} from 'lucide-react';
import * as paymentsApi from '../../../api/payments';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function PendingPayments() {
  const { token } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [filter, setFilter] = useState('');

  const load = async () => {
    try { 
      setLoading(true); 
      const res = await paymentsApi.listPendingPayments(token); 
      setItems(res.data || []); 
    } catch (e) { 
      toast.error(e?.response?.data?.error || 'No se pudo cargar pagos'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const verify = async (pid) => {
    setVerifying(pid);
    try { 
      await paymentsApi.verifyPayment(pid, token); 
      toast.success('Pago verificado exitosamente'); 
      await load(); 
    } catch (e) { 
      toast.error(e?.response?.data?.error || 'No se pudo verificar'); 
    } finally { 
      setVerifying(null); 
    }
  };

  const filtered = useMemo(() => {
    if (!filter) return items;
    const f = filter.toLowerCase();
    return items.filter(p => 
      String(p.account_id).includes(f) || 
      (p.reference_number || '').toLowerCase().includes(f) || 
      p.payment_method.toLowerCase().includes(f)
    );
  }, [filter, items]);

  const mapMethod = (m) => {
    const map = {
      cash_usd: 'Divisas en Efectivo',
      cash_bs: 'Bolívares en Efectivo',
      transfer_bs: 'Transferencia',
      mobile_payment_bs: 'Pago Móvil'
    }; 
    return map[m] || m;
  };

  const formatDateTime = (dt) => {
    if (!dt) return '-';
    // Fix iOS/Safari date parsing issues with standard SQL format
    const norm = typeof dt === 'string' && dt.includes(' ') && !dt.includes('T') ? dt.replace(' ', 'T') : dt;
    const d = new Date(norm);
    if (Number.isNaN(d.getTime())) return dt;
    return d.toLocaleString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h3 className="font-bold text-xl text-gray-900">Pagos Pendientes</h3>
           <p className="text-sm text-gray-500">Verifica y aprueba las transacciones realizadas</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" 
                placeholder="Buscar por referencia..." 
              />
           </div>
           <button onClick={load} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <History className="w-5 h-5" />
           </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
           <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-gray-300" />
           </div>
           <p className="text-gray-500 font-medium">Todo está al día</p>
           <p className="text-sm text-gray-400">No hay pagos pendientes de verificación</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all group">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                     <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="bg-gray-50 px-3 py-1 rounded-lg text-xs font-mono text-gray-500">
                     #{p.account_id}
                  </div>
               </div>

               <div className="space-y-1 mb-4">
                  <div className="text-2xl font-bold text-gray-900">{p.currency} {Number(p.amount).toFixed(2)}</div>
                  <div className="text-sm text-gray-500 font-medium">{mapMethod(p.payment_method)}</div>
                  {p.reference_number && (
                    <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded inline-block mt-1">Ref: {p.reference_number}</div>
                  )}
               </div>

               <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div>
                     <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">FECHA</div>
                     <div className="text-xs font-medium text-gray-700">{formatDateTime(p.payment_date)}</div>
                  </div>
                  <button 
                    disabled={verifying === p.id} 
                    onClick={() => verify(p.id)} 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-900/10"
                  >
                     {verifying === p.id ? '...' : 'Verificar'}
                     <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
