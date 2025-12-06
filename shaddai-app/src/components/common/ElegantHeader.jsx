import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export default function ElegantHeader({ 
  icon: Icon, 
  sectionName, 
  title, 
  highlightText, 
  description, 
  children 
}) {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-8 relative">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl -z-10 mix-blend-multiply animate-blob"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl -z-10 mix-blend-multiply animate-blob animation-delay-2000"></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 ring-1 ring-indigo-100">
              {Icon && <Icon size={20} strokeWidth={2.5} />}
            </div>
            <span className="text-sm font-semibold text-indigo-900/50 tracking-wide uppercase">{sectionName}</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-800 mb-3 leading-tight">
            {title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">{highlightText}</span>
          </h1>
          
          <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed">
            {description}
          </p>

          {children && <div className="mt-6">{children}</div>}
        </div>
        
        <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
           <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-slate-100 shadow-sm text-slate-500 text-sm font-semibold hover:shadow-md transition-shadow cursor-default">
              <Calendar size={16} className="text-indigo-500"/>
              <span className="capitalize">{date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
