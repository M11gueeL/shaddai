import React, { useEffect, useState } from 'react';
import { 
  FileText, Search, Download, History, BookOpen, AlertOctagon, CheckCircle2 
} from 'lucide-react';
import * as receiptsApi from '../../../api/receipts';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function ReceiptsAdmin() {
  const { token } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  const load = async () => {
    try { 
      setLoading(true); 
      const res = await receiptsApi.listAllReceipts({ page, limit: LIMIT, search, status: statusFilter }, token);
      setItems(res.data || []); 
    } catch (e) { 
      toast.error('No se pudo cargar la lista de recibos'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const download = async (id, number) => {
    try {
      const res = await receiptsApi.downloadReceipt(id, token);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_${number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      toast.error('Error al descargar el PDF');
    }
  };

  const StatusBadge = ({ status }) => {
    if (status === 'annulled') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
          <AlertOctagon className="w-3.5 h-3.5" />
          ANULADO
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
        <CheckCircle2 className="w-3.5 h-3.5" />
        ACTIVO
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
             <BookOpen className="w-6 h-6 text-gray-400" />
             Historial de Recibos
           </h3>
           <p className="text-sm text-gray-500">Registro completo de recibos emitidos</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
           {/* Status Filter */}
           <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
           >
              <option value="">Todos los Estados</option>
              <option value="active">Activos</option>
              <option value="annulled">Anulados</option>
           </select>

           <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" 
                placeholder="Buscar recibo o paciente..." 
              />
           </div>
           <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
             Buscar
           </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
             <tr>
               <th className="px-4 py-3 rounded-l-xl">No. Recibo</th>
               <th className="px-4 py-3">Fecha</th>
               <th className="px-4 py-3">Paciente</th>
               <th className="px-4 py-3">Emitido por</th>
               <th className="px-4 py-3">Estado</th>
               <th className="px-4 py-3 text-right rounded-r-xl">Acciones</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">Cargando...</td></tr>
             ) : items.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No se encontraron recibos</td></tr>
             ) : items.map(r => (
               <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                 <td className="px-4 py-3 font-mono font-medium text-gray-900">{r.receipt_number}</td>
                 <td className="px-4 py-3 text-gray-500">{new Date(r.issued_at).toLocaleString()}</td>
                 <td className="px-4 py-3 font-medium text-gray-900">{r.patient_name}</td>
                 <td className="px-4 py-3 text-gray-500">{r.issued_by_name || 'Sistema'}</td>
                 <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                 <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => download(r.id, r.receipt_number)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                      title="Descargar PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Simple */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
         <button 
           onClick={() => setPage(p => Math.max(1, p - 1))} 
           disabled={page === 1}
           className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
         >
           Anterior
         </button>
         <span className="text-sm text-gray-500">Página {page}</span>
         <button 
           onClick={() => setPage(p => p + 1)} 
           disabled={items.length < LIMIT}
           className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
         >
           Siguiente
         </button>
      </div>
    </div>
  );
}
