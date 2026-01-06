import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  ClipboardList, 
  CreditCard, 
  Package, 
  Trash2, 
  Plus, 
  Wallet, 
  HandCoins, 
  Search, 
  CheckCircle2, 
  XCircle,
  FileText,
  User,
  MoreVertical,
  ChevronRight,
  ArrowRight,
  DollarSign,
  AlertCircle
} from 'lucide-react';

import * as accountsApi from '../../api/accounts';
import * as servicesApi from '../../api/services';
import * as paymentsApi from '../../api/payments';
import * as ratesApi from '../../api/rates';
import * as receiptsApi from '../../api/receipts';
import * as inventoryApi from '../../api/inventoryApi';
import PatientsApi from '../../api/PatientsApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pendiente', classes: 'text-amber-700 bg-amber-50 border-amber-200' },
    partially_paid: { label: 'Parcial', classes: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    paid: { label: 'Pagada', classes: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    cancelled: { label: 'Anulada', classes: 'text-slate-700 bg-slate-100 border-slate-200' },
    pending_verification: { label: 'Por verificar', classes: 'text-sky-700 bg-sky-50 border-sky-200' }
  };
  const m = map[status] || { label: status, classes: 'text-gray-700 bg-gray-50 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${m.classes}`}>
       {m.label}
    </span>
  );
}

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

function AccountCard({ account, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col items-start text-left p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 w-full overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <FileText className="w-20 h-20 text-gray-900" />
      </div>

      <div className="flex justify-between w-full mb-4">
        <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">#{account.id}</span>
        <StatusBadge status={account.status} />
      </div>

      <div className="space-y-1 mb-6 relative z-10">
        <div className="text-lg font-bold text-gray-900 line-clamp-1">{account.patient_name}</div>
        {account.payer_name && <div className="text-sm text-gray-500">Pagador: {account.payer_name}</div>}
      </div>

      <div className="mt-auto w-full pt-4 border-t border-gray-50 flex justify-between items-center group-hover:border-gray-100 transition-colors">
        <div className="text-xs text-gray-400">{account.created_at?.split(' ')[0]}</div>
        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}

function SelectedUserCard({ user, onRemove, label, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
          <Icon className="w-4 h-4" />
        </div>
        <div>
           <div className="text-sm font-semibold text-gray-900">{user.full_name}</div>
           <div className="text-[10px] uppercase font-bold text-indigo-400">{label}</div>
        </div>
      </div>
      <button onClick={onRemove} className="p-1.5 hover:bg-white rounded-lg text-indigo-400 hover:text-indigo-600 transition-colors">
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------
// DETAIL VIEW COMPONENT
// ----------------------------------------------------------------------

function AccountDetailView({ account, details, setDetails, onBack, onReload, rate, receiptInfo, token }) {
  const { confirm } = useConfirm();
  const toast = useToast();
  const [tab, setTab] = useState('services'); // services | payments | supplies
  const { hasRole } = useAuth();
  
  const PAYMENT_METHODS = {
    cash_bs: 'Bolívares en efectivo',
    cash_usd: 'Divisas en efectivo',
    transfer_bs: 'Transferencia en Bolívares',
    mobile_payment_bs: 'Pago Móvil'
  };

  // Loaders for selects
  const [servicesList, setServicesList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  
  // Form states
  const [serviceId, setServiceId] = useState('');
  const [serviceQty, setServiceQty] = useState(1);
  const [itemId, setItemId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  
  // Payment states
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash_bs');
  const [ref, setRef] = useState('');
  const [file, setFile] = useState(null);

  // Load lists
  useEffect(() => {
    servicesApi.listServices(token).then(r => setServicesList(r.data || [])).catch(()=>{});
    inventoryApi.listInventory({onlyActive:1}, token).then(r => setInventoryList(r.data?.filter(i=>i.is_active) || [])).catch(()=>{});
  }, [token]);

  // Calculations
  const canModify = !['paid', 'cancelled'].includes(account.status);
  
  const payments = account.payments || [];
  const validPayments = payments.filter(p => p.status !== 'rejected');
  const paidUsd = validPayments.reduce((acc, p) => acc + Number(p.amount_usd_equivalent || 0), 0);
  
  const totalUsd = Number(account.total_usd || 0);
  const totalBs = Number(account.total_bs || 0);
  const pendingUsd = Math.max(0, totalUsd - paidUsd);
  
  // Local estimated Bs pending
  const currentRate = Number(account.rate_bcv || rate || 0);
  const pendingBs = currentRate ? pendingUsd * currentRate : 0;

  // Actions
  const handleAddService = async () => {
    if(!serviceId) return;
    try {
      await accountsApi.addDetail(account.id, { service_id: serviceId, quantity: serviceQty }, token);
      toast.success('Servicio añadido');
      setServiceId(''); setServiceQty(1);
      onReload();
    } catch(e) { toast.error('Error al agregar servicio'); }
  };

  const handleAddSupply = async () => {
    if(!itemId) return;
    try {
      await accountsApi.addSupply(account.id, { item_id: itemId, quantity: itemQty }, token);
      toast.success('Insumo añadido');
      setItemId(''); setItemQty(1);
      onReload();
    } catch(e) { toast.error('Error al agregar insumo'); }
  };

  const removeItem = async (id, type) => {
    if(!await confirm({ title: 'Eliminar item', message: '¿Seguro que deseas eliminar este elemento?' })) return;
    try {
      if(type === 'service') await accountsApi.removeDetail(id, token);
      else await accountsApi.removeSupply(id, token);
      toast.success('Eliminado correctamente');
      onReload();
    } catch(e) { toast.error('Error al eliminar'); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if(!amount) return;
    
    // Validation
    const val = parseFloat(amount);
    
    // 1. Negative check
    if (val <= 0) return toast.warning('El monto debe ser positivo');

    // 2. Integer check for Cash
    if ((method === 'cash_usd' || method === 'cash_bs') && !Number.isInteger(val)) {
        return toast.warning('Los pagos en efectivo no pueden tener decimales');
    }

    // 3. Balance check
    if (method === 'cash_usd') {
       if(val > pendingUsd) return toast.warning('El monto excede el saldo pendiente en Divisas');
    } else {
       // if electronic or cash in Bs, check limits with small tolerance
       const maxBs = pendingBs + 0.5; 
       if(val > maxBs) return toast.warning('El monto excede el saldo pendiente en Bs');
    }

    const form = new FormData();
    form.append('payment_method', method);
    form.append('amount', val);
    form.append('currency', method === 'cash_usd' ? 'USD' : 'BS');
    if(ref) form.append('reference_number', ref);
    if(file) form.append('attachment', file);

    try {
      await paymentsApi.createPayment(account.id, form, token);
      toast.success('Pago registrado');
      setAmount(''); setRef(''); setFile(null);
      onReload();
    } catch(e) { toast.error('Error al registrar pago'); }
  };

  const handleReceipt = async () => {
    if(!receiptInfo) return;
    try {
      const r = await receiptsApi.downloadReceipt(receiptInfo.id, token);
      const blob = new Blob([r.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_${receiptInfo.receipt_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch(e) { toast.error('Error al descargar recibo'); }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6 animate-in slide-in-from-right duration-500">
      {/* Top Navigation */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Volver al listado
      </button>

      {/* Account Header Card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0" />
        
        <div className="relative z-10 p-6 sm:p-8">
           <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-gray-400">#{account.id}</span>
                  <StatusBadge status={account.status} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{account.patient_name}</h1>
                <p className="text-sm text-gray-500 mt-1">Responsable: <span className="font-medium text-gray-700">{account.payer_name}</span></p>
                
                {account.status === 'paid' && receiptInfo && (
                  <button onClick={handleReceipt} className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Descargar Recibo
                  </button>
                )}
              </div>

              {/* Financial Summary */}
              <div className="flex gap-4 sm:gap-8 bg-gray-50/80 backdrop-blur p-4 rounded-2xl border border-gray-100">
                 <div className="text-right">
                    <div className="text-xs uppercase font-bold text-gray-400 mb-1">Total</div>
                    <div className="text-xl font-bold text-gray-900">${totalUsd.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Bs {totalBs.toFixed(2)}</div>
                 </div>
                 <div className="w-px bg-gray-200" />
                 <div className="text-right">
                    <div className="text-xs uppercase font-bold text-gray-400 mb-1">Pagado</div>
                    <div className="text-xl font-bold text-emerald-600">${paidUsd.toFixed(2)}</div>
                 </div>
                 <div className="w-px bg-gray-200" />
                 <div className="text-right">
                    <div className="text-xs uppercase font-bold text-gray-400 mb-1">Pendiente</div>
                    <div className="text-xl font-bold text-rose-600">${pendingUsd.toFixed(2)}</div>
                    <div className="text-xs text-rose-600/70 font-medium">~Bs {pendingBs.toFixed(2)}</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 sm:px-8">
           <div className="flex gap-6 overflow-x-auto">
             <TabBtn active={tab==='services'} onClick={()=>setTab('services')} icon={ClipboardList} label="Servicios" count={details.length} />
             <TabBtn active={tab==='supplies'} onClick={()=>setTab('supplies')} icon={Package} label="Insumos" count={account.supplies?.length || 0} />
             <TabBtn active={tab==='payments'} onClick={()=>setTab('payments')} icon={CreditCard} label="Pagos" count={validPayments.length} />
           </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
           {tab === 'services' && (
             <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <ClipboardList className="w-5 h-5 text-gray-400" /> Servicios Facturados
               </h3>
               {details.length === 0 ? (
                 <EmptyState label="No hay servicios agregados" />
               ) : (
                 <div className="space-y-2">
                   {details.map(d => (
                     <ItemRow 
                       key={d.id} 
                       title={d.service_name} 
                       qty={d.quantity} 
                       price={d.price_usd} 
                       total={d.price_usd * (d.quantity||1)} 
                       onDelete={canModify ? ()=>removeItem(d.id,'service') : null} 
                     />
                   ))}
                 </div>
               )}
               {canModify && (
                 <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex gap-3">
                       <select value={serviceId} onChange={(e)=>setServiceId(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-900/10 outline-none">
                          <option value="">Agregar servicio...</option>
                          {servicesList.map(s => <option key={s.id} value={s.id}>{s.name} (${Number(s.price_usd).toFixed(2)})</option>)}
                       </select>
                       <input type="number" min="1" value={serviceQty} onChange={(e)=>setServiceQty(e.target.value)} className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/10" />
                       <button onClick={handleAddService} disabled={!serviceId} className="px-5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                         <Plus className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
               )}
             </div>
           )}

           {tab === 'supplies' && (
             <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <Package className="w-5 h-5 text-gray-400" /> Insumos Médicos
               </h3>
               {!account.supplies?.length ? (
                 <EmptyState label="No hay insumos cargados" />
               ) : (
                 <div className="space-y-2">
                   {account.supplies.map(s => (
                     <ItemRow 
                       key={s.id} 
                       title={s.description || s.item_name} 
                       qty={s.quantity} 
                       price={s.price_usd} 
                       total={s.total_price_usd} 
                       onDelete={canModify ? ()=>removeItem(s.id,'supply') : null} 
                     />
                   ))}
                 </div>
               )}
               {canModify && (
                 <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex gap-3">
                       <select value={itemId} onChange={(e)=>setItemId(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-900/10 outline-none">
                          <option value="">Agregar insumo...</option>
                          {inventoryList.map(i => <option key={i.id} value={i.id}>{i.name} (Stock: {i.stock_quantity}) - ${Number(i.price_usd).toFixed(2)}</option>)}
                       </select>
                       <input type="number" min="1" value={itemQty} onChange={(e)=>setItemQty(e.target.value)} className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/10" />
                       <button onClick={handleAddSupply} disabled={!itemId} className="px-5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                         <Plus className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
               )}
             </div>
           )}

           {tab === 'payments' && (
             <div className="space-y-6">
                {/* Payments List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                   <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <HistoryIcon className="w-5 h-5 text-gray-400" /> Historial de Pagos
                   </h3>
                   {validPayments.length === 0 ? (
                      <EmptyState label="No se han registrado pagos" />
                   ) : (
                      <div className="space-y-3">
                        {validPayments.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                             <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white rounded-xl text-gray-600 shadow-sm">
                                   {p.payment_method?.includes('cash') ? <DollarSign className="w-5 h-5"/> : <CreditCard className="w-5 h-5"/>}
                                </div>
                                <div>
                                   <div className="font-semibold text-gray-900">
                                      {p.currency} {Number(p.amount).toFixed(2)}
                                   </div>
                                   <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                                      {PAYMENT_METHODS[p.payment_method] || p.payment_method}
                                   </div>
                                </div>
                             </div>
                             
                             <div className="flex flex-col items-end gap-1">
                                {p.status === 'verified' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">VERIFICADO</span>}
                                {p.status === 'pending' && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">PENDIENTE</span>}
                                <div className="text-xs text-gray-400">
                                   {p.currency === 'BS' ? `~ $${Number(p.amount_usd_equivalent).toFixed(2)}` : ''}
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                   )}
                </div>
             </div>
           )}
        </div>

        {/* Action Sidebar (Right 1/3) */}
        <div className="lg:col-span-1">
           {canModify ? (
             <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-6">
               <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
                 <HandCoins className="w-5 h-5 text-indigo-600" /> Registrar Pago
               </h3>
               
               <form onSubmit={handlePayment} className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Método</label>
                   <select value={method} onChange={(e)=>setMethod(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                      {Object.entries(PAYMENT_METHODS).map(([val, label]) => (
                         <option key={val} value={val}>{label}</option>
                      ))}
                   </select>
                 </div>

                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Monto ({method.includes('bs') ? 'Bs' : 'USD'})</label>
                   <div className="relative">
                      <input 
                        type="number" 
                        step="0.01" 
                        value={amount} 
                        onChange={(e)=>setAmount(e.target.value)} 
                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl pl-4 pr-12 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                        placeholder="0.00" 
                      />
                      <button type="button" onClick={() => setAmount(method.includes('usd') ? pendingUsd.toFixed(2) : pendingBs.toFixed(2))} className="absolute right-2 top-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition">Complete</button>
                   </div>
                   {method.includes('bs') && amount && (
                     <div className="text-right mt-1 text-xs text-gray-400">
                        ~ ${(Number(amount) / currentRate).toFixed(2)} USD
                     </div>
                   )}
                 </div>

                 {(method === 'transfer_bs' || method === 'mobile_payment_bs') && (
                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                       <input 
                         placeholder="Nro. Referencia" 
                         value={ref} 
                         onChange={(e)=>setRef(e.target.value)}
                         className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                       />
                       <div className="flex items-center gap-2 text-xs text-gray-400">
                         <input type="file" onChange={(e)=>setFile(e.target.files?.[0])} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors" />
                       </div>
                    </div>
                 )}

                 <button 
                  type="submit" 
                  disabled={!amount}
                  className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:translate-y-px"
                >
                   Procesar Pago
                 </button>
               </form>
             </div>
           ) : (
             <div className="bg-gray-50 rounded-[2rem] p-8 text-center border border-dashed border-gray-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-gray-900 font-bold mb-1">Cuenta Cerrada</h3>
                <p className="text-sm text-gray-500">No se pueden realizar más modificaciones en esta cuenta.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button 
      onClick={onClick} 
      className={`
        flex items-center gap-2 py-4 border-b-2 transition-all min-w-max
        ${active ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}
      `}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : ''}`} />
      <span className="font-medium">{label}</span>
      {count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function ItemRow({ title, qty, price, total, onDelete }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-400 mt-0.5 flex gap-2">
           <span>Can: {qty}</span>
           <span>•</span>
           <span>Unit: ${Number(price).toFixed(2)}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
         <div className="font-bold text-gray-900">${Number(total).toFixed(2)}</div>
         {onDelete && (
           <button onClick={onDelete} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
             <Trash2 className="w-4 h-4" />
           </button>
         )}
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
       <Package className="w-10 h-10 mb-3 opacity-20" />
       <p className="text-sm">{label}</p>
    </div>
  );
}

function HistoryIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" /><path d="M3 3v9h9" /><path d="M12 7v5l4 2" /></svg>
}
