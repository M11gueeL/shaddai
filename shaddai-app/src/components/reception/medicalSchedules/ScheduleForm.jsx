import { useEffect, useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import api from '../../../api/medicalSchedules';
import DoctorSelector from '../appointments/DoctorSelector';

const days = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

export default function ScheduleForm({ initial = null, onCancel, onSaved }) {
  const isEdit = !!initial?.id;
  const { token, hasRole } = useAuth();
  const toast = useToast();

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [day, setDay] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initial) return;
    // Try to prefill doctor from initial.medical_name
    let doc = null;
    if (initial.medical_id) {
      const parts = (initial.medical_name || '').split(' ');
      doc = { id: initial.medical_id, first_name: parts[0] || '', last_name: parts.slice(1).join(' ') };
    }
    setSelectedDoctor(doc);
    setDay(String(initial.day_of_week || ''));
    setStart((initial.start_time || '').slice(0,5));
    setEnd((initial.end_time || '').slice(0,5));
    setNotes(initial.notes || '');
  }, [initial]);

  const canEdit = hasRole(['admin']);

  const validate = () => {
    if (!selectedDoctor?.id) return 'Seleccione un médico';
    if (!day) return 'Seleccione el día';
    if (!start || !end) return 'Ingrese la hora de inicio y fin';
    if (end <= start) return 'La hora fin debe ser mayor a la hora inicio';
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    const err = validate();
    if (err) { toast.warning(err); return; }

    const payload = {
      medical_id: selectedDoctor.id,
      day_of_week: Number(day),
      start_time: start,
      end_time: end,
      notes: notes || null,
    };

    try {
      setSaving(true);
      if (isEdit) {
        await api.update(initial.id, payload, token);
        toast.success('Horario actualizado');
      } else {
        await api.create(payload, token);
        toast.success('Horario creado');
      }
      onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'No se pudo guardar el horario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{isEdit ? 'Editar horario' : 'Nuevo horario'}</h3>
        <button type="button" className="p-2 rounded hover:bg-gray-100" onClick={onCancel}>
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Médico</label>
          <DoctorSelector selectedDoctor={selectedDoctor} onSelect={setSelectedDoctor} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Día de la semana</label>
          <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300" value={day} onChange={(e)=>setDay(e.target.value)}>
            <option value="">Seleccione...</option>
            {days.map(d=> <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Inicio</label>
          <input type="time" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300" value={start} onChange={(e)=>setStart(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Fin</label>
          <input type="time" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300" value={end} onChange={(e)=>setEnd(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Notas</label>
          <textarea rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300" value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Opcional" />
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={saving || !canEdit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg inline-flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
