import React, { useEffect, useMemo, useState } from 'react';
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

  // Vista previa de IMC local (antes de enviar)
  const bmiPreview = useMemo(() => {
    const w = parseFloat(form?.weight);
    const h = parseFloat(form?.height);
    if (w && h && h > 0) return (w / (h * h)).toFixed(2);
    return '';
  }, [form?.weight, form?.height]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm">
      <div className="p-4 text-slate-800 font-medium">Signos vitales</div>
      <div className="p-4 border-t">
        <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            ['systolic_bp','PA sistólica','mmHg','1'],
            ['diastolic_bp','PA diastólica','mmHg','1'],
            ['heart_rate','Pulso','lpm','1'],
            ['respiratory_rate','Frecuencia respiratoria','rpm','1'],
            ['temperature','Temperatura','°C','0.1'],
            ['oxygen_saturation','Sat. de oxígeno','%','1'],
            ['weight','Peso','kg','0.1'],
            ['height','Talla','m','0.01'],
          ].map(([k, lbl, unit, step]) => (
            <div key={k}>
              <label className="text-sm text-slate-600">{lbl}</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  step={step}
                  className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 pr-14 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                  placeholder={`Ej.: ${k==='temperature'?'36.8':k==='oxygen_saturation'?'98':k==='heart_rate'?'72':k==='respiratory_rate'?'16':k==='systolic_bp'?'120':k==='diastolic_bp'?'80':k==='weight'?'70':k==='height'?'1.70':''}`}
                  value={form?.[k] || ''}
                  onChange={(e)=>setForm({...form,[k]:e.target.value})}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{unit}</span>
              </div>
            </div>
          ))}
          <div className="col-span-2 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="text-sm text-slate-600">Notas</label>
              <input
                className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-inner placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                placeholder="Ej.: Medición en reposo, brazo derecho."
                value={form?.notes || ''}
                onChange={(e)=>setForm({...form,notes:e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">IMC (auto)</label>
              <input
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
                value={bmiPreview}
                placeholder="—"
                disabled
              />
            </div>
          </div>
          <div className="col-span-2 md:col-span-3 flex justify-end">
            <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700">Registrar</button>
          </div>
        </form>
      </div>
      <div className="divide-y">
        {items?.length ? items.map(v => (
          <div key={v.id} className="px-4 py-3 text-sm text-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{new Date(v.recorded_at).toLocaleString()}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              {(v.systolic_bp != null || v.diastolic_bp != null)
                ? renderChip('PA', `${v.systolic_bp ?? '-'} / ${v.diastolic_bp ?? '-'}`, 'mmHg')
                : null}
              {renderChip('Pulso', v.heart_rate, 'lpm')}
              {renderChip('FR', v.respiratory_rate, 'rpm')}
              {renderChip('Temp', v.temperature, '°C')}
              {renderChip('Sat O₂', v.oxygen_saturation, '%')}
              {renderChip('Peso', v.weight, 'kg')}
              {renderChip('Talla', v.height, 'm')}
              {renderChip('IMC', v.bmi, '')}
            </div>
            {v.notes && <div className="text-xs text-slate-500 mt-2">Notas: {v.notes}</div>}
          </div>
        )) : <div className="px-4 py-6 text-sm text-slate-500">Sin registros</div>}
      </div>
    </div>
  );
}

function renderChip(label, value, unit) {
  if (value === null || value === undefined || value === '' || value === ' / ') return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
      <span className="font-medium text-slate-600">{label}</span>
      <span className="tabular-nums">{value}{unit ? ` ${unit}` : ''}</span>
    </span>
  );
}
