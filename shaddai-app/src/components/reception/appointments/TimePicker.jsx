import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

// Utility to compare HH:MM strings
const compareTime = (a, b) => {
  // returns negative if a < b, 0 if equal, positive if a > b
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  if (ah !== bh) return ah - bh;
  return am - bm;
};

const clampStart = (start, min) => (compareTime(start, min) < 0 ? min : start);

const pad2 = (n) => String(n).padStart(2, '0');

const generateSlots = (start = '08:00', end = '19:00', step = 15) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);

  const out = [];
  let totalStart = sh * 60 + sm;
  const totalEnd = eh * 60 + em;
  for (let t = totalStart; t <= totalEnd; t += step) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    out.push(`${pad2(h)}:${pad2(m)}`);
  }
  return out;
};

export default function TimePicker({
  value,
  onChange,
  min = '08:00',
  start = '08:00',
  end = '19:00',
  step = 15,
  placeholder = 'Seleccionar hora',
  error,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const effectiveStart = useMemo(() => clampStart(start, min), [start, min]);

  const options = useMemo(() => {
    // Generate from max(start, min) to end
    const all = generateSlots(effectiveStart, end, step);
    return all.filter((t) => compareTime(t, min) >= 0);
  }, [effectiveStart, end, step, min]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll to selected or first option when opening
  useEffect(() => {
    if (!open || !listRef.current) return;
    const list = listRef.current;
    const selected = list.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: 'center' });
    } else if (list.firstChild) {
      list.firstChild.scrollIntoView({ block: 'center' });
    }
  }, [open, options]);

  const handleSelect = (t) => {
    if (disabled) return;
    onChange && onChange(t);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
      >
        <span className={`flex items-center ${value ? 'text-gray-900' : 'text-gray-500'}`}>
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          {value || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <div
            ref={listRef}
            className="max-h-64 overflow-auto py-2"
            role="listbox"
            aria-label="Seleccionar hora"
          >
            {options.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No hay horarios disponibles</div>
            )}
            {options.map((t) => {
              const selected = t === value;
              return (
                <button
                  key={t}
                  type="button"
                  data-selected={selected ? 'true' : 'false'}
                  onClick={() => handleSelect(t)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-blue-50 ${
                    selected ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                  }`}
                  role="option"
                  aria-selected={selected}
                >
                  <span>{t}</span>
                  {selected && (
                    <span className="text-xs font-medium text-blue-700">Seleccionado</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
