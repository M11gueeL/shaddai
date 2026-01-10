import React, { useState } from 'react';
import { 
    X, 
    CalendarDays, 
    Download, 
    FileText 
} from 'lucide-react';
import * as paymentApi from '../../../../api/payments';

export default function GeneralIncomeReportModal({ token, onClose }) {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const handleDownloadPdf = async () => {
        setGeneratingPdf(true);
        try {
            const response = await paymentApi.downloadGeneralReportPdf(startDate, endDate, token);
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Ingresos_${startDate}_${endDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading PDF", error);
            alert("Error al descargar el PDF");
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Reporte General</h3>
                            <p className="text-xs text-gray-500">Descargar en PDF</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-2">
                        <p className="text-sm text-indigo-800 text-center">
                            Seleccione el rango de fechas para generar el reporte consolidado de ingresos.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                                Fecha Inicial
                            </label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                                Fecha Final
                            </label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleDownloadPdf}
                        disabled={generatingPdf}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-3 mt-4"
                    >
                        {generatingPdf ? (
                            <>
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                Generando PDF...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Descargar Reporte PDF
                            </>
                        )}
                    </button>
                    
                </div>
            </div>
        </div>
    );
}
