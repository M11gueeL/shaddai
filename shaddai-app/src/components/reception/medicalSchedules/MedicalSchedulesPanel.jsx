import { useEffect, useMemo, useState } from 'react';
import { X, Plus, Filter, Search, RefreshCw, CalendarClock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import DoctorSelector from '../appointments/DoctorSelector';
import api from '../../../api/medicalSchedules';
import SchedulesTable from './SchedulesTable';
import ScheduleForm from './ScheduleForm';

const days = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

export default function MedicalSchedulesPanel({ onClose }) {
  const { token, hasRole } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [dayFilter, setDayFilter] = useState('');
  const [searchNotes, setSearchNotes] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const canEdit = hasRole(['admin']);

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedDoctor]);

  const load = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.list(token, { doctorId: selectedDoctor?.id });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setItems(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'No se pudo cargar los horarios');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...items];
    if (dayFilter) {
      list = list.filter(r => String(r.day_of_week) === String(dayFilter));
    }
    if (searchNotes.trim()) {
      const q = searchNotes.toLowerCase();
      list = list.filter(r => (r.notes || '').toLowerCase().includes(q) || (r.medical_name || '').toLowerCase().includes(q));
    }
    if (timeStart) {
      list = list.filter(r => r.start_time >= timeStart);
    }
    if (timeEnd) {
      list = list.filter(r => r.end_time <= timeEnd);
    }
    return list;
  }, [items, dayFilter, searchNotes, timeStart, timeEnd]);

  const onCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setShowForm(true);
  };

  const onDelete = async (row) => {
    const ok = await confirm({
      title: 'Eliminar horario',
      message: `¿Deseas eliminar el horario del Dr(a). ${row.medical_name} (${formatDay(row.day_of_week)})?`,
      confirmText: 'Eliminar',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await api.remove(row.id, token);
      toast.success('Horario eliminado');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'No se pudo eliminar');
    }
  };

  const onSaved = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-auto flex flex-col h-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
            <CalendarClock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Horarios Médicos</h2>
            <p className="text-gray-500 text-sm">Gestiona los horarios preferidos de los médicos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={load} 
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
            title="Refrescar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50/50">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Médico</label>
            <DoctorSelector selectedDoctor={selectedDoctor} onSelect={setSelectedDoctor} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Día</label>
            <div className="relative">
              <select className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none" value={dayFilter} onChange={(e)=>setDayFilter(e.target.value)}>
                <option value="">Todos</option>
                {days.map(d=> <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">De</label>
            <input type="time" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" value={timeStart} onChange={(e)=>setTimeStart(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">A</label>
            <input type="time" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" value={timeEnd} onChange={(e)=>setTimeEnd(e.target.value)} />
          </div>
          <div className="md:col-span-1">
             {canEdit && (
              <button 
                onClick={onCreate} 
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nuevo
              </button>
            )}
          </div>
        </div>
        
         {/* Search Bar - Second Row */}
         <div className="mt-4 relative">
            <input 
              placeholder="Buscar por notas, nombre del médico..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
              value={searchNotes} 
              onChange={(e)=>setSearchNotes(e.target.value)} 
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <SchedulesTable
          items={filtered}
          loading={loading}
          error={error}
          canEdit={canEdit}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={()=>setShowForm(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6">
            <ScheduleForm
              initial={editing}
              onCancel={()=>{ setShowForm(false); setEditing(null); }}
              onSaved={onSaved}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function formatDay(day){
  const d = days.find(x=> String(x.value) === String(day));
  return d?.label || day;
}
