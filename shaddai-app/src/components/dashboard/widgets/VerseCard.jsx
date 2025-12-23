import React, { useEffect, useState } from "react";
import { getVerseOfTheDay } from "../../../api/bibleApi"; 
import { Quote, ArrowRight } from "lucide-react";

export default function VerseCard() {
  const [votd, setVotd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVotd = async () => {
      try {
        const data = await getVerseOfTheDay();
        if (data && data.votd) setVotd(data.votd);
      } catch (error) {
        console.error("Error cargando versículo", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVotd();
  }, []);

  const cleanVerseText = (rawText) => {
    if (!rawText) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawText, "text/html");
    let text = doc.body.textContent || "";
    text = text.replace(/\[.*?\]/g, "");
    text = text.replace(/^["“]/, '').replace(/["”]$/, '');
    return text.trim();
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-xl p-8 flex flex-col justify-center min-h-[320px] h-full">
      {/* Decoración superior */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>
      <Quote className="absolute top-8 right-8 w-16 h-16 text-slate-50 rotate-180 transform scale-y-[-1]" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex flex-col h-full">
          <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 flex-none">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            Versículo del Día
          </h3>
          
          {loading ? (
            <div className="space-y-4 animate-pulse my-auto">
              <div className="h-4 bg-slate-100 rounded-full w-full"></div>
              <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
              <div className="h-4 bg-slate-100 rounded-full w-4/6"></div>
            </div>
          ) : votd ? (
            <blockquote className="flex-1 min-h-0 flex flex-col justify-center">
              <div className="relative w-full">
                
                <span className="absolute -top-2 left-0 text-4xl text-emerald-500 font-bold leading-none select-none z-20 font-serif">
                  “
                </span>
                
                {/* Scroll Area */}
                <div 
                  className="overflow-y-auto px-6 py-1 max-h-[180px] custom-scroll-area"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(16, 185, 129, 0.2) transparent'
                  }}
                >
                  <style>
                    {`
                      .custom-scroll-area::-webkit-scrollbar { width: 4px; }
                      .custom-scroll-area::-webkit-scrollbar-track { background: transparent; }
                      .custom-scroll-area::-webkit-scrollbar-thumb { background-color: rgba(16, 185, 129, 0.2); border-radius: 20px; }
                      .custom-scroll-area::-webkit-scrollbar-thumb:hover { background-color: rgba(16, 185, 129, 0.5); }
                    `}
                  </style>
                  <p className="text-2xl font-serif text-slate-700 italic leading-relaxed">
                    {cleanVerseText(votd.text)}
                  </p>
                </div>

                <span className="absolute -bottom-4 right-2 text-4xl text-emerald-500 font-bold leading-none select-none z-20 font-serif">
                  ”
                </span>
              </div>
            </blockquote>
          ) : (
            <p className="text-slate-400 italic text-xl my-auto">"Lámpara es a mis pies tu palabra, y lumbrera a mi camino."</p>
          )}
        </div>

        {votd && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 flex-none">
            <span className="font-bold text-slate-800 text-sm bg-slate-100 px-4 py-1.5 rounded-full">
              {votd.display_ref}
            </span>
            <a 
              href={votd.permalink} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
            >
              Leer contexto 
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}