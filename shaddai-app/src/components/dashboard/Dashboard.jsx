import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());

  const firstName = useMemo(() => {
    if (!user) return "";
    // Intentar distintos posibles nombres según API
    const raw = user.first_name || user.firstName || user.name || "";
    return String(raw).split(" ")[0];
  }, [user]);

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
    if (has("admin")) return "Administrador"; // Requisito: forma neutra exacta
    if (has("medico") || has("doctor") || has("doctora")) return isFemale ? "Dra." : "Dr.";
    return ""; // Recepción u otros: saludo simple sin título
  }, [rolesNormalized, isFemale]);

  // Nombre formateado: Primer nombre + Primer apellido
  const firstLast = useMemo(() => {
    const first = (user?.first_name || user?.firstName || user?.name || "").toString().trim();
    const last = (user?.last_name || user?.lastName || "").toString().trim();
    const firstToken = first.split(/\s+/)[0] || "";
    const lastToken = last.split(/\s+/)[0] || "";
    return `${firstToken} ${lastToken}`.trim();
  }, [user]);

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
              {/* Línea 1: Buenos días/tardes/noches */}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {greeting}!
              </h1>
              {/* Línea 2: Bienvenido/a + título + nombre */}
              <p className="mt-1 text-lg sm:text-xl font-medium">
                {greetingWord}
                {roleTitle ? `, ${roleTitle} ` : ", "}
                {firstLast} 👋
              </p>
              {/* Línea 3: Fecha del día */}
              <p className="mt-2 text-white/90">
                Hoy es {todayLabel}.
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
