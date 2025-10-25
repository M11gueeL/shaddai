import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());

  // Utilidad: Title Case amigable para nombres en español (con pequeñas excepciones)
  const toTitleCaseEs = (str) => {
    if (!str) return "";
    const lower = String(str).toLowerCase().trim();
    const smallWords = new Set(["de", "del", "la", "las", "los", "y", "e", "o", "a"]);
    return lower
      .split(/\s+/)
      .map((w, i) => {
        // Mantener minúsculas para ciertas preposiciones en medio del nombre
        if (i !== 0 && smallWords.has(w)) return w;
        return w.replace(/^(\p{L})(.*)$/u, (_, f, r) => f.toUpperCase() + r);
      })
      .join(" ");
  };

  const roles = useMemo(() => {
    if (!user?.roles) return [];
    return Array.isArray(user.roles) ? user.roles : [user.roles];
  }, [user]);

  // Saludo por momento del día (actualiza en vivo con el reloj)
  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return "¡Buenos días";
    if (h < 19) return "¡Buenas tardes";
    return "¡Buenas noches";
  }, [now]);

  const todayLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("es-ES", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
        .format(new Date())
        .replace(/^(\w)/, (m) => m.toUpperCase());
    } catch (e) {
      return new Date().toLocaleDateString("es-ES");
    }
  }, []);

  // Reloj en vivo
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
    } catch (e) {
      return now.toLocaleTimeString("es-ES");
    }
  }, [now]);

  const gender = String(user?.gender ?? "").toLowerCase();
  const isFemale = ["f", "fem", "female", "femenino", "mujer"].includes(gender);

  const greetingWord = isFemale ? "Bienvenida" : "Bienvenido";

  // Normalizar roles a minúsculas para comparaciones robustas
  const rolesNormalized = useMemo(() => roles.map((r) => String(r).toLowerCase()), [roles]);

  // Prioridad de título: Admin > Médico > (Recepción u otros => sin título)
  const roleTitle = useMemo(() => {
    const has = (r) => rolesNormalized.includes(r);
    if (has("admin")) return "Administrador";
    if (has("medico") || has("doctor") || has("doctora")) return "Médico";
    if (has("recepcionista") || has("recepcion") || has("receptionist")) return "Recepcionista";
    return "";
  }, [rolesNormalized]);

  // Nombre completo: usar todos los tokens de first_name/last_name; fallback a name
  const fullNameRaw = useMemo(() => {
    const first = (user?.first_name || user?.firstName || "").toString().trim();
    const last = (user?.last_name || user?.lastName || "").toString().trim();
    let combined = `${first} ${last}`.trim();
    if (!combined) {
      combined = (user?.name || "").toString().trim();
    }
    return combined.replace(/\s+/g, " ");
  }, [user]);

  const fullName = useMemo(() => toTitleCaseEs(fullNameRaw), [fullNameRaw]);

  return (
    <section className="flex flex-col h-full p-6 sm:p-8 lg:p-10 space-y-8">
      {/* Bienvenida enfocada al usuario */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white">
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/60 blur-3xl" />
        </div>
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              {/* Línea 1: Estilo banco - Hola, Nombre Completo */}
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Hola, {fullName} <span role="img" aria-label="mano saludando">👋</span>
              </h1>
              {/* Línea 2: Saludo por momento del día + chip de rol si aplica */}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-white/90">{greeting}! Hoy es {todayLabel}.</p>
                {roleTitle && (
                  <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                    {roleTitle}
                  </span>
                )}
              </div>
              {/* Línea 3: Mensaje corto estilo banco */}
              <p className="mt-2 text-white/90">
                {greetingWord} de nuevo. Esperamos que tengas un gran día.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3">
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg" aria-live="polite">{timeLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
