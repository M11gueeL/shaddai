import { Download, FileSpreadsheet, FileText, Users, CalendarRange, BarChart2, Printer } from 'lucide-react';

const cardBase = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";

export default function ReportsActions() {
  return (
    <div className={`${cardBase} h-full flex flex-col`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Reportes y Exportaciones</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">Accesos rápidos para descargar reportes de citas y pacientes. (Decorativo por ahora)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Citas */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarRange className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-800">Citas</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <GhostButton icon={FileSpreadsheet} color="emerald" label="CSV" />
            <GhostButton icon={FileSpreadsheet} color="indigo" label="Excel" />
            <GhostButton icon={FileText} color="rose" label="PDF" />
          </div>
        </div>

        {/* Pacientes */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-800">Pacientes</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <GhostButton icon={FileSpreadsheet} color="emerald" label="CSV" />
            <GhostButton icon={FileSpreadsheet} color="indigo" label="Excel" />
            <GhostButton icon={FileText} color="rose" label="PDF" />
          </div>
        </div>

        {/* Atajos */}
        <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-gray-800">Atajos</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <PillButton icon={FileText} color="blue" label="Agenda de hoy (PDF)" />
            <PillButton icon={FileText} color="violet" label="Reporte semanal" />
            <PillButton icon={FileText} color="cyan" label="Reporte mensual" />
            <PillButton icon={Printer} color="slate" label="Imprimir" />
            <PillButton icon={Download} color="teal" label="Exportar todo" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GhostButton({ icon: Icon, label, color = 'slate' }){
  const palette = {
    slate: 'text-slate-700 hover:bg-slate-50 border-slate-200',
    emerald: 'text-emerald-700 hover:bg-emerald-50 border-emerald-200',
    indigo: 'text-indigo-700 hover:bg-indigo-50 border-indigo-200',
    rose: 'text-rose-700 hover:bg-rose-50 border-rose-200',
  }[color] || 'text-slate-700 hover:bg-slate-50 border-slate-200';

  return (
    <button type="button" disabled className={`px-3 py-2 border rounded-lg inline-flex items-center gap-2 cursor-not-allowed opacity-80 ${palette}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function PillButton({ icon: Icon, label, color = 'blue' }){
  const palette = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    violet: 'bg-violet-50 text-violet-700 hover:bg-violet-100',
    cyan: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
    slate: 'bg-slate-50 text-slate-700 hover:bg-slate-100',
    teal: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
  }[color] || 'bg-slate-50 text-slate-700 hover:bg-slate-100';

  return (
    <button type="button" disabled className={`px-3 py-2 rounded-full inline-flex items-center gap-2 cursor-not-allowed opacity-80 ${palette}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
