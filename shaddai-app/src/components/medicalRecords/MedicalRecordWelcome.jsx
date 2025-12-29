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
                    <div className="absolute -inset-1 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg border border-slate-100 group-hover:shadow-xl transition-shadow duration-300">
                        <FileText className="w-10 h-10 text-teal-600 group-hover:text-teal-800 transition-colors duration-300" />
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
                        Utilice la barra de búsqueda superior para seleccionar a un paciente. Podrá acceder a su historia clínica, registrar nuevas consultas y gestionar antecedentes médicos.
                    </p>
                </div>
            </div>
        </div>
    );
}