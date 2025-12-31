import React from 'react';
import { 
    Search, 
    FileText, 
    ArrowUp 
} from 'lucide-react';

export default function MedicalRecordWelcome() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-100 shadow-sm min-h-[600px]">
            <div className="max-w-lg w-full text-center space-y-10 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4">
                
                {/* Hero Icon Section */}
                <div className="relative group mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                    <div className="relative flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 group-hover:scale-105 transition-transform duration-500 ease-out">
                        <FileText className="w-12 h-12 text-blue-600/80" strokeWidth={1.5} />
                        <div className="absolute -bottom-2 -right-2 p-3 bg-white rounded-full shadow-lg border border-slate-50">
                            <div className="bg-blue-600 rounded-full p-2">
                                <Search className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Text Content */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-light text-slate-800 tracking-tight">
                        Historia Clínica Digital
                    </h2>
                    <p className="text-slate-500 text-lg font-light leading-relaxed max-w-md mx-auto">
                        Seleccione un paciente para comenzar.
                        <br />
                        <span className="text-sm text-slate-400 mt-2 block">
                            Gestione consultas, antecedentes y reportes de forma integral.
                        </span>
                    </p>
                </div>

                {/* Visual Cue */}
                <div className="pt-8 flex flex-col items-center gap-3 opacity-40 animate-bounce duration-[2000ms]">
                    <ArrowUp className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Buscar arriba</span>
                </div>
            </div>
        </div>
    );
}