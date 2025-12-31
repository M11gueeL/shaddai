import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Heart, Thermometer, Wind, Scale, Ruler, FileText, Plus, Clock, ArrowRight } from 'lucide-react';
import medicalRecordsApi from '../../../api/medicalRecords';
import { useToast } from '../../../context/ToastContext';

export default function VitalsSection({ recordId, token }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});

  const load = async () => {
    try {
      const res = await medicalRecordsApi.listVitalSignsForRecord?.(recordId, token);
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

  const bmiPreview = useMemo(() => {
    const w = parseFloat(form?.weight);
    const h = parseFloat(form?.height);
    if (w && h && h > 0) return (w / (h * h)).toFixed(2);
    return '';
  }, [form?.weight, form?.height]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-start gap-4">
        <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <Activity className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-slate-800">Signos Vitales</h3>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Registre y monitoree los indicadores fisiológicos del paciente. El IMC se calculará automáticamente.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 sticky top-6">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-rose-600" /> Nuevo Registro
                </h4>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <VitalInput 
                            label="PA Sistólica" 
                            icon={<Activity className="w-3.5 h-3.5" />} 
                            value={form?.systolic_bp} 
                            onChange={v => setForm({...form, systolic_bp: v})} 
                            unit="mmHg" 
                            placeholder="120"
                        />
                        <VitalInput 
                            label="PA Diastólica" 
                            icon={<Activity className="w-3.5 h-3.5" />} 
                            value={form?.diastolic_bp} 
                            onChange={v => setForm({...form, diastolic_bp: v})} 
                            unit="mmHg" 
                            placeholder="80"
                        />
                        <VitalInput 
                            label="Pulso" 
                            icon={<Heart className="w-3.5 h-3.5" />} 
                            value={form?.heart_rate} 
                            onChange={v => setForm({...form, heart_rate: v})} 
                            unit="lpm" 
                            placeholder="72"
                        />
                        <VitalInput 
                            label="Frec. Resp." 
                            icon={<Wind className="w-3.5 h-3.5" />} 
                            value={form?.respiratory_rate} 
                            onChange={v => setForm({...form, respiratory_rate: v})} 
                            unit="rpm" 
                            placeholder="16"
                        />
                        <VitalInput 
                            label="Temperatura" 
                            icon={<Thermometer className="w-3.5 h-3.5" />} 
                            value={form?.temperature} 
                            onChange={v => setForm({...form, temperature: v})} 
                            unit="°C" 
                            step="0.1" 
                            placeholder="36.5"
                        />
                        <VitalInput 
                            label="Sat. O₂" 
                            icon={<Activity className="w-3.5 h-3.5" />} 
                            value={form?.oxygen_saturation} 
                            onChange={v => setForm({...form, oxygen_saturation: v})} 
                            unit="%" 
                            placeholder="98"
                        />
                        <VitalInput 
                            label="Peso" 
                            icon={<Scale className="w-3.5 h-3.5" />} 
                            value={form?.weight} 
                            onChange={v => setForm({...form, weight: v})} 
                            unit="kg" 
                            step="0.1" 
                            placeholder="70.5"
                        />
                        <VitalInput 
                            label="Talla" 
                            icon={<Ruler className="w-3.5 h-3.5" />} 
                            value={form?.height} 
                            onChange={v => setForm({...form, height: v})} 
                            unit="m" 
                            step="0.01" 
                            placeholder="1.75"
                        />
                    </div>

                    {bmiPreview && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">IMC Estimado</span>
                            <span className="text-sm font-bold text-slate-800">{bmiPreview}</span>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Notas Adicionales</label>
                        <textarea 
                            rows={2} 
                            className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all outline-none placeholder:text-slate-400 resize-none" 
                            placeholder="Ej.: Medición en reposo, brazo derecho." 
                            value={form?.notes || ''} 
                            onChange={(e)=>setForm({...form, notes:e.target.value})} 
                        />
                    </div>

                    <div className="pt-2">
                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 text-white font-medium shadow-lg shadow-rose-200 hover:bg-rose-700 hover:shadow-rose-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
                            <Plus className="w-4 h-4" /> Registrar Signos
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-4">
            {items?.length ? items.map(v => (
                <div key={v.id} className="group rounded-2xl bg-white p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            {new Date(v.recorded_at).toLocaleString()}
                        </div>
                        {v.bmi && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                                IMC: {v.bmi}
                            </span>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <VitalDisplay label="Presión Arterial" value={v.systolic_bp && v.diastolic_bp ? `${v.systolic_bp}/${v.diastolic_bp}` : '-'} unit="mmHg" icon={<Activity className="w-4 h-4 text-rose-500" />} />
                        <VitalDisplay label="Pulso" value={v.heart_rate} unit="lpm" icon={<Heart className="w-4 h-4 text-rose-500" />} />
                        <VitalDisplay label="Frec. Resp." value={v.respiratory_rate} unit="rpm" icon={<Wind className="w-4 h-4 text-blue-500" />} />
                        <VitalDisplay label="Temperatura" value={v.temperature} unit="°C" icon={<Thermometer className="w-4 h-4 text-amber-500" />} />
                        <VitalDisplay label="Sat. O₂" value={v.oxygen_saturation} unit="%" icon={<Activity className="w-4 h-4 text-emerald-500" />} />
                        <VitalDisplay label="Peso" value={v.weight} unit="kg" icon={<Scale className="w-4 h-4 text-indigo-500" />} />
                        <VitalDisplay label="Talla" value={v.height} unit="m" icon={<Ruler className="w-4 h-4 text-violet-500" />} />
                    </div>

                    {v.notes && (
                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-start gap-2 text-sm text-slate-600 bg-slate-50/50 p-3 rounded-xl">
                            <FileText className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                            <p>{v.notes}</p>
                        </div>
                    )}
                </div>
            )) : (
                <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-12 text-center">
                    <Activity className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-slate-900 font-medium">Sin registros de signos vitales</h3>
                    <p className="text-slate-500 text-sm mt-1">Utilice el formulario para añadir una nueva medición.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

function VitalInput({ label, icon, value, onChange, unit, step="1", placeholder }) {
    return (
        <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1">
                {icon} {label}
            </label>
            <div className="relative">
                <input
                    type="number"
                    step={step}
                    className="w-full rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all outline-none placeholder:text-slate-300"
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{unit}</span>
            </div>
        </div>
    );
}

function VitalDisplay({ label, value, unit, icon }) {
    if (!value || value === '-') return null;
    return (
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-sm font-bold text-slate-800">
                    {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
                </p>
            </div>
        </div>
    );
}
