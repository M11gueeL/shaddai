import { useEffect, useMemo, useState } from 'react';
import { X, Plus, Filter, Search, RefreshCw } from 'lucide-react';
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
    <div className="h-[85vh] flex flex-col">
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Horarios Médicos</h2>
          <p className="text-sm text-gray-500">Gestiona los horarios preferidos de los médicos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refrescar
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/60">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-600">Médico</label>
            <DoctorSelector selectedDoctor={selectedDoctor} onSelect={setSelectedDoctor} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Día</label>
            <div className="relative">
              <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300" value={dayFilter} onChange={(e)=>setDayFilter(e.target.value)}>
                <option value="">Todos</option>
                {days.map(d=> <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Desde</label>
            <input type="time" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300" value={timeStart} onChange={(e)=>setTimeStart(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Hasta</label>
            <input type="time" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300" value={timeEnd} onChange={(e)=>setTimeEnd(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-600">Buscar</label>
            <div className="relative">
              <input placeholder="Notas, nombre del médico..." className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300" value={searchNotes} onChange={(e)=>setSearchNotes(e.target.value)} />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="flex items-end">
            {canEdit && (
              <button onClick={onCreate} className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> Nuevo horario
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
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
          <div className="fixed inset-0 bg-black/40" onClick={()=>setShowForm(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl p-5">
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
