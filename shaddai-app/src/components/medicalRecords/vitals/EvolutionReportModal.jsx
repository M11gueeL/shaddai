import React, { useState } from 'react';
import { X, FileText, Calendar, Clock, Download } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function EvolutionReportModal({ isOpen, onClose, recordId }) {
  const { token } = useAuth();
  const toast = useToast();
  const [type, setType] = useState('day'); // day, range
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('start_date', startDate);
      if (type === 'range') {
        params.append('end_date', endDate);
      } else {
        params.append('end_date', startDate); // Same day
      }
      
      if (startTime) params.append('start_time', startTime);
      if (endTime) params.append('end_time', endTime);

      // Construct URL directly since it's a download
      // Usar la URL hardcodeada temporalmente si no hay variable de entorno, para coincidir con el resto de la app
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/shaddai/shaddai-api/public';
      const url = `${API_URL}/medicalrecords/${recordId}/reports/evolution?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Verificar que sea un PDF real
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/pdf') === -1) {
          console.error('Respuesta no es PDF:', await response.text());
          throw new Error('El servidor no devolvió un PDF válido. Posible error de ruta.');
      }

      if (!response.ok) throw new Error('Error al generar reporte');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Evolucion_${startDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Reporte descargado');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Ficha de Evolución</h3>
              <p className="text-xs text-slate-500">Exportar signos vitales</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Type Selection */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setType('day')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Día Específico
            </button>
            <button 
              onClick={() => setType('range')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'range' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Rango de Fechas
            </button>
          </div>

          {/* Date Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                {type === 'day' ? 'Fecha' : 'Desde'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            {type === 'range' && (
              <div className="animate-in slide-in-from-top-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Hasta</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Time Inputs (Optional) */}
          <div className="pt-2 border-t border-slate-50">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Filtrar por Hora (Opcional)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="time" 
                    className="w-full pl-10 pr-2 py-2.5 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <span className="text-[10px] text-slate-400 ml-1">Inicio</span>
              </div>
              <div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="time" 
                    className="w-full pl-10 pr-2 py-2.5 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                <span className="text-[10px] text-slate-400 ml-1">Fin</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-700 hover:shadow-rose-300 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generando...' : (
              <>
                <Download className="w-4 h-4" /> Exportar PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}