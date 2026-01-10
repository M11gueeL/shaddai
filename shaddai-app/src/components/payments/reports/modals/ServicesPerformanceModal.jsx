import React, { useState } from 'react';
import { X, Calendar, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as paymentApi from '../../../../api/payments';

export default function ServicesPerformanceModal({ onClose, token }) {
    // Default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = today.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(lastDay);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!startDate || !endDate) return toast.error("Seleccione ambas fechas");
        
        try {
            setLoading(true);
            const response = await paymentApi.downloadServicesPerformanceReportPdf(startDate, endDate, token);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Rendimiento_Servicios_${startDate}_${endDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Reporte descargado correctamente");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error al generar el reporte");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-amber-50">
                     <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Rendimiento por Servicios
                     </h3>
                     <button onClick={onClose} className="p-1 hover:bg-amber-100 rounded-full text-amber-600 transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-500">
                        Seleccione el rango de fechas para analizar qué servicios han tenido mayor demanda y facturación.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase">Desde</label>
                            <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase">Hasta</label>
                            <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm shadow-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {loading ? 'Generando...' : 'Descargar PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
}
