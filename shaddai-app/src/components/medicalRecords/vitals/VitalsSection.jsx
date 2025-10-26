import React, { useEffect, useState } from 'react';
import medicalRecordsApi from '../../../api/medicalRecords';
import { useToast } from '../../../context/ToastContext';

export default function VitalsSection({ recordId, token }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});

  const load = async () => {
    try {
      const res = await medicalRecordsApi.listVitalSignsForRecord?.(recordId, token);
      // Fallback if method missing (older client)
      if (!res && medicalRecordsApi.listVitalSignsForRecord === undefined) {
        const res2 = await medicalRecordsApi.getById(recordId, token);
        const vitals = res2.data?.vital_signs || [];
        setItems(vitals);
        return;
      }
      setItems(res?.data || []);
    } catch (e) {
      setItems([]);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [recordId]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await medicalRecordsApi.addVitalSignsForRecord(recordId, form, token);
      toast.success('Signos registrados');
      setForm({});
      load();
    } catch (e) { toast.error('No se pudo registrar'); }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-4 text-gray-800 font-medium">Signos vitales</div>
      <div className="p-4 border-t">
        <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['systolic_bp','PA sistólica'],
            ['diastolic_bp','PA diastólica'],
            ['heart_rate','Pulso'],
            ['respiratory_rate','FR'],
            ['temperature','Temperatura'],
            ['oxygen_saturation','Sat O₂'],
            ['weight','Peso (kg)'],
            ['height','Talla (m)'],
          ].map(([k, lbl]) => (
            <div key={k}>
              <label className="text-sm text-gray-600">{lbl}</label>
              <input type="number" step="any" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form?.[k] || ''} onChange={(e)=>setForm({...form,[k]:e.target.value})} />
            </div>
          ))}
          <div className="md:col-span-4">
            <label className="text-sm text-gray-600">Notas</label>
            <input className="w-full mt-1 px-3 py-2 border rounded-lg" value={form?.notes || ''} onChange={(e)=>setForm({...form,notes:e.target.value})} />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Registrar</button>
          </div>
        </form>
      </div>
      <div className="divide-y">
        {items?.length ? items.map(v => (
          <div key={v.id} className="px-4 py-3 text-sm text-gray-700">
            <div className="text-xs text-gray-500">{new Date(v.recorded_at).toLocaleString()}</div>
            <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
              {renderMetric('PA', `${v.systolic_bp || '-'} / ${v.diastolic_bp || '-'}`)}
              {renderMetric('Pulso', v.heart_rate)}
              {renderMetric('FR', v.respiratory_rate)}
              {renderMetric('Temp', v.temperature)}
              {renderMetric('Sat O₂', v.oxygen_saturation)}
              {renderMetric('Peso', v.weight)}
              {renderMetric('Talla', v.height)}
              {renderMetric('IMC', v.bmi)}
            </div>
            {v.notes && <div className="text-xs text-gray-500 mt-1">Notas: {v.notes}</div>}
          </div>
        )) : <div className="px-4 py-6 text-sm text-gray-500">Sin registros</div>}
      </div>
    </div>
  );
}

function renderMetric(label, value) {
  if (value === null || value === undefined || value === '') return null;
  return <div><span className="text-gray-500">{label}:</span> {value}</div>;
}
