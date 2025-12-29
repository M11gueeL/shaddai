import React from 'react';
import { 
    Search, 
    UserPlus, 
    FileText, 
    Activity, 
    ClipboardList, 
    ArrowUp 
} from 'lucide-react';

export default function MedicalRecordWelcome() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-2 rounded-2xl border border-dashed border-slate-200 min-h-[500px]">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                
                {/* Hero Icon Section */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-100 to-blue-100 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg border border-slate-100">
                        <FileText className="w-10 h-10 text-teal-600" />
                        <div className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full border-4 border-white shadow-sm">
                            <Search className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Main Text Content */}
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Consulta de Historia Clínica
                    </h2>
                    <p className="text-slate-500 text-base leading-relaxed">
                        Selecciona un paciente usando la barra superior para comenzar la consulta.
                    </p>
                </div>
            </div>
        </div>
    );
}