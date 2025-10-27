import React, { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, Loader2, X } from 'lucide-react';
import PatientsApi from '../../api/PatientsApi';
import { useAuth } from '../../context/AuthContext';

export default function SearchPatientBar({ onSearchByCedula, onSearchByPatientId, loading }) {
  const { token } = useAuth();

  // Query principal (antes "cedula") para soportar búsqueda rápida por nombre, cédula, teléfono, etc.
  const [query, setQuery] = useState('');

  // Typeahead state
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ by: ['cedula', 'full_name'], dob: '' });

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (!token) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      setHighlightIndex(-1);
      return;
    }

    setIsSearching(true);
    const handle = setTimeout(async () => {
      try {
        const res = await PatientsApi.search({ q, by: filters.by, dob: filters.dob || null, limit: 8 }, token);
        const items = Array.isArray(res.data) ? res.data : [];
        setResults(items);
        setIsOpen(true);
        setHighlightIndex(items.length ? 0 : -1);
      } catch (e) {
        setResults([]);
        setIsOpen(false);
        setHighlightIndex(-1);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [query, filters.by, filters.dob, token]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const onClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const onSelectPatient = (p) => {
    setIsOpen(false);
    setQuery(`${p.full_name} · C.I: ${p.cedula}`);
    onSearchByPatientId?.(String(p.id));
  };

  const onSubmitQuery = () => {
    const q = query.trim();
    if (!q) return;
    // Si parece una cédula (solo dígitos y longitud >=5), usar la búsqueda directa existente
    if (/^\d{5,}$/.test(q)) {
      onSearchByCedula?.(q);
    } else {
      // Si hay resultados visibles, seleccionar el destacado
      if (isOpen && results.length && highlightIndex >= 0) {
        onSelectPatient(results[highlightIndex]);
      }
    }
  };

  const onKeyDown = (e) => {
    if (!isOpen || !results.length) {
      if (e.key === 'Enter') onSubmitQuery();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0) onSelectPatient(results[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const toggleBy = (key) => {
    setFilters((prev) => {
      const set = new Set(prev.by);
      if (set.has(key)) set.delete(key); else set.add(key);
      const next = Array.from(set);
      // Evitar quedar sin ningún campo
      return { ...prev, by: next.length ? next : ['cedula'] };
    });
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4 shadow-sm"
    >
      {/* Buscador principal con typeahead */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            className="w-full rounded-xl border border-slate-200 bg-white/70 pl-10 pr-20 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
            placeholder="Buscar historia clínica de paciente por cédula, nombre, teléfono o email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length && setIsOpen(true)}
            onKeyDown={onKeyDown}
          />
          {query && (
            <button
              onClick={clearQuery}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            aria-label="Abrir filtros"
          >
          </button>
        </div>

        {/* Dropdown resultados */}
        {isOpen && (
          <div className="absolute z-20 mt-2 w-full max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white/95 shadow-lg">
            {isSearching && (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
              </div>
            )}
            {!isSearching && results.length === 0 && (
              <div className="px-3 py-2 text-sm text-slate-500">Sin resultados</div>
            )}
            {!isSearching && results.map((p, idx) => (
              <button
                key={p.id}
                onMouseEnter={() => setHighlightIndex(idx)}
                onClick={() => onSelectPatient(p)}
                className={`w-full text-left px-3 py-2 text-sm border-t border-slate-100 transition-colors ${idx === highlightIndex ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
              >
                <div className="font-medium text-slate-900">{p.full_name}</div>
                <div className="text-slate-600 text-xs">C.I: {p.cedula} {p.birth_date ? `· Nac: ${p.birth_date}` : ''} {p.phone ? `· Tel: ${p.phone}` : ''}</div>
              </button>
            ))}
          </div>
        )}

        
      </div>
    </div>
  );
}
