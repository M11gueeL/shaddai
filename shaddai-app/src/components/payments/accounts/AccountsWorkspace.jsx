import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Plus, 
  Search, 
  XCircle,
  User,
  Wallet
} from 'lucide-react';

import * as accountsApi from '../../../api/accounts';
import * as ratesApi from '../../../api/rates';
import * as receiptsApi from '../../../api/receipts';
import PatientsApi from '../../../api/PatientsApi';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';

import AccountCard from './AccountCard';
import SelectedUserCard from './SelectedUserCard';
import AccountDetailView from './AccountDetailView';

export default function AccountsWorkspace() {
  const detailsRef = useRef(null);
  const { token } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [details, setDetails] = useState([]);
  const [rate, setRate] = useState(null);
  const [receiptInfo, setReceiptInfo] = useState(null);
  
  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [chosenPatient, setChosenPatient] = useState(null);
  const [chosenPayer, setChosenPayer] = useState(null);
  const [patientQuery, setPatientQuery] = useState('');
  const [payerQuery, setPayerQuery] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [payerResults, setPayerResults] = useState([]);

  // Load Data
  const load = async () => {
    try {
      setLoading(true);
      const res = await accountsApi.listAccounts(statusFilter ? { status: statusFilter } : undefined, token);
      setAccounts(res.data || []);
    } catch (e) {
      toast.error('Error al cargar cuentas');
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (accountId) => {
    try {
      const res = await accountsApi.getAccount(accountId, token);
      setSelected(res.data || null);
      setDetails((res.data && res.data.details) ? res.data.details : []);
      if(res?.data?.rate_bcv) setRate(Number(res.data.rate_bcv));
      
      if(res?.data?.status === 'paid'){
         try { const r = await receiptsApi.getReceiptByAccount(accountId, token); setReceiptInfo(r?.data || null); } catch { setReceiptInfo(null); }
      } else { setReceiptInfo(null); }
      
      setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      toast.error('Error al cargar detalles de la cuenta');
      setSelected(null);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => {
    ratesApi.getTodayRate(token).then(r => setRate(Number(r?.data?.rate_bcv || 0))).catch(()=>{});
  }, []);

  const filteredAccounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(acc => 
      `${acc.id} ${acc.patient_name || ''} ${acc.payer_name || ''}`.toLowerCase().includes(q)
    );
  }, [accounts, query]);

  // Handle Create Account
  const handleCreate = async () => {
    if(!chosenPatient || !chosenPayer) return toast.warning('Selecciona paciente y pagador');
    try {
      const res = await accountsApi.createAccount({ patient_id: chosenPatient.id, payer_patient_id: chosenPayer.id }, token);
      if(res?.data?.id) {
        toast.success('Cuenta creada exitosamente');
        setCreateOpen(false);
        await load();
        handleSelectAccount(res.data.id);
      }
    } catch(e) { toast.error(e?.response?.data?.error || 'Error al crear cuenta'); }
  };

  // Search Helpers
  const searchPatients = async (q, setResults) => {
    if(q.trim().length < 2) { setResults([]); return; }
    try { const r = await PatientsApi.search({ q, limit: 5 }, token); setResults(r.data || []); } catch { setResults([]); }
  };

  const handleSelectAccount = (id) => loadDetails(id);

  if(selected) {
    return (
      <div ref={detailsRef}>
        <AccountDetailView 
          account={selected} 
          details={details}
          setDetails={setDetails}
          onBack={() => { setSelected(null); load(); }} // Reload list on back to refresh statuses
          onReload={() => loadDetails(selected.id)}
          rate={rate}
          receiptInfo={receiptInfo}
          token={token}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cuentas de Cobro</h2>
          <p className="text-sm text-gray-500">Gestión de estados de cuenta y facturación</p>
        </div>
        <button 
          onClick={() => {
            setCreateOpen(true); 
            setChosenPatient(null); setChosenPayer(null); 
            setPatientQuery(''); setPayerQuery(''); 
            setPatientResults([]); setPayerResults([]);
          }} 
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-medium shadow-lg shadow-gray-900/10 hover:bg-gray-800 transition-all hover:translate-y-px"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Cuenta</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por #, paciente o pagador..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm min-w-[180px]"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="partially_paid">Pago Parcial</option>
          <option value="paid">Pagadas</option>
          <option value="cancelled">Anuladas</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
             <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No se encontraron cuentas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map(acc => (
            <AccountCard key={acc.id} account={acc} onClick={() => handleSelectAccount(acc.id)} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Nueva Cuenta</h3>
                <p className="text-sm text-gray-500">Asigna paciente y responsable financiero</p>
              </div>
              <button onClick={() => setCreateOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Patient Select */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Paciente</label>
                  {chosenPatient ? (
                    <SelectedUserCard user={chosenPatient} onRemove={() => setChosenPatient(null)} label="Paciente" icon={User} />
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="Buscar paciente..."
                        value={patientQuery}
                        onChange={(e) => { setPatientQuery(e.target.value); searchPatients(e.target.value, setPatientResults); }}
                      />
                      {patientResults.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10">
                          {patientResults.map(p => (
                            <button key={p.id} onClick={() => { setChosenPatient(p); setPatientResults([]); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between group">
                              <div>
                                <div className="font-medium text-gray-900">{p.full_name}</div>
                                <div className="text-xs text-gray-500">CI: {p.cedula}</div>
                              </div>
                              <Plus className="w-4 h-4 text-gray-300 group-hover:text-indigo-600" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Payer Select */}
                <div className="space-y-3">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Responsable de Pago</label>
                   {chosenPayer ? (
                    <SelectedUserCard user={chosenPayer} onRemove={() => setChosenPayer(null)} label="Pagador" icon={Wallet} />
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="Buscar responsable..."
                        value={payerQuery}
                        onChange={(e) => { setPayerQuery(e.target.value); searchPatients(e.target.value, setPayerResults); }}
                      />
                      {payerResults.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10">
                          {payerResults.map(p => (
                            <button key={p.id} onClick={() => { setChosenPayer(p); setPayerResults([]); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between group">
                              <div>
                                <div className="font-medium text-gray-900">{p.full_name}</div>
                                <div className="text-xs text-gray-500">CI: {p.cedula}</div>
                              </div>
                              <Plus className="w-4 h-4 text-gray-300 group-hover:text-indigo-600" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setCreateOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-100 transition-all">Cancelar</button>
              <button onClick={handleCreate} disabled={!chosenPatient || !chosenPayer} className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-900/10 transition-all">Confirmar Creación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
