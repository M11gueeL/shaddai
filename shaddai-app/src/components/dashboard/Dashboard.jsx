import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Clock } from "lucide-react";
import { getVerseOfTheDay } from "../../api/bibleApi";

export default function Dashboard() {
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());

  const [votd, setVotd] = useState(null);
  const [loadingVotd, setLoadingVotd] = useState(true);
  const [errorVotd, setErrorVotd] = useState(false);

  useEffect(() => {
    const fetchVotd = async () => {
      try {
        const data = await getVerseOfTheDay();
        if (data && data.votd) {
          setVotd(data.votd);
        } else {
          setErrorVotd(true);
        }
      } catch (error) {
        setErrorVotd(true);
      } finally {
        setLoadingVotd(false);
      }
    };
    fetchVotd();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const toTitleCaseEs = (str) => {
    if (!str) return "";
    const lower = String(str).toLowerCase().trim();
    const smallWords = new Set(["de", "del", "la", "las", "los", "y", "e", "o", "a"]);
    return lower
      .split(/\s+/)
      .map((w, i) => {
        if (i !== 0 && smallWords.has(w)) return w;
        return w.replace(/^(\p{L})(.*)$/u, (_, f, r) => f.toUpperCase() + r);
      })
      .join(" ");
  };

  const roles = useMemo(() => {
    if (!user?.roles) return [];
    return Array.isArray(user.roles) ? user.roles : [user.roles];
  }, [user]);

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

  const rolesNormalized = useMemo(() => roles.map((r) => String(r).toLowerCase()), [roles]);
  const roleTitle = useMemo(() => {
    const has = (r) => rolesNormalized.includes(r);
    if (has("admin")) return "Administrador";
    if (has("medico") || has("doctor") || has("doctora")) return "Médico";
    if (has("recepcionista") || has("recepcion") || has("receptionist")) return "Recepcionista";
    return "";
  }, [rolesNormalized]);

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
    <section className="relative min-h-full overflow-hidden bg-slate-950/5">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" aria-hidden />
      <div className="absolute -top-40 -left-32 -z-10 h-80 w-80 rounded-full bg-indigo-200/70 blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 -right-32 -z-10 h-96 w-96 rounded-full bg-cyan-200/60 blur-3xl" aria-hidden />

      <div className="relative flex flex-col gap-8 px-4 py-8 sm:px-6 md:px-10 lg:px-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
          <article className="relative overflow-hidden rounded-3xl border border-white/20 bg-slate-950 text-white shadow-xl shadow-indigo-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-indigo-500/80 to-cyan-500/80" aria-hidden />
            <div className="absolute -top-24 right-10 h-48 w-48 rounded-full bg-white/20 blur-3xl" aria-hidden />
            <div className="absolute bottom-0 left-0 h-32 w-56 bg-white/10 blur-2xl" aria-hidden />
            <div className="relative p-7 sm:p-9 lg:p-12">
              <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-4">
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                    Panel Principal
                  </p>
                  <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                    Hola, {fullName} <span role="img" aria-label="mano saludando">👋</span>
                  </h1>
                  <div className="space-y-2 text-lg text-white/85">
                    <p>
                      {greeting}! Hoy es {todayLabel}.
                    </p>
                    <p>
                      {greetingWord} de nuevo. Esperamos que tengas un gran día lleno de propósito.
                    </p>
                  </div>
                </div>
                <div className="flex min-w-[230px] flex-col gap-3 rounded-2xl border border-white/30 bg-white/10 px-5 py-4 backdrop-blur-lg">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Hora actual</span>
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                      <Clock className="h-6 w-6" />
                    </span>
                    <span className="font-mono text-2xl font-semibold" aria-live="polite">{timeLabel}</span>
                  </div>
                  {roleTitle && (
                    <span className="inline-flex items-center self-start rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                      {roleTitle}
                    </span>
                  )}
                </div>
              </header>
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-7 shadow-xl shadow-indigo-500/10 backdrop-blur-lg sm:px-7">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Resumen Personal</p>
              <div className="space-y-3 text-sm text-slate-600">
                <p className="text-base font-semibold text-slate-900">{fullName || "Usuario"}</p>
                <p className="leading-relaxed text-slate-600">
                  Administra tu agenda, registra actividades y mantente al día con tus pacientes.
                </p>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium tracking-[0.25em] text-slate-500">
                  {roles.length ? roles.map((role) => toTitleCaseEs(role)).join(" · ") : "Sin rol asignado"}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-indigo-500/10">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" aria-hidden />
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" aria-hidden />
          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 sm:text-2xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">📖</span>
                Versículo del Día
              </h2>

              {loadingVotd ? (
                <div className="flex animate-pulse flex-col gap-3 rounded-2xl border border-dashed border-indigo-200/70 bg-indigo-50/40 p-6">
                  <div className="h-4 w-3/4 rounded-full bg-indigo-200/80" />
                  <div className="h-4 w-1/2 rounded-full bg-indigo-200/60" />
                  <div className="h-4 w-full rounded-full bg-indigo-200/40" />
                </div>
              ) : errorVotd ? (
                <figure className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-slate-600">
                  <blockquote className="text-lg italic leading-relaxed text-slate-700">
                    "Lámpara es a mis pies tu palabra, y lumbrera a mi camino."
                  </blockquote>
                  <figcaption className="text-right text-sm font-semibold text-indigo-600">— Salmos 119:105</figcaption>
                </figure>
              ) : (
                <figure className="space-y-4">
                  <blockquote className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 text-base leading-relaxed text-slate-700 sm:text-lg">
                    <span dangerouslySetInnerHTML={{ __html: votd.text }} />
                  </blockquote>
                  <figcaption className="flex justify-end text-sm font-semibold text-indigo-600">
                    <a
                      href={votd.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors hover:bg-indigo-100"
                      title="Ver en BibleGateway"
                    >
                      — {votd.display_ref}
                    </a>
                  </figcaption>
                </figure>
              )}
            </div>

            <div className="hidden h-full rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-100 via-white to-cyan-100 p-6 shadow-inner lg:flex lg:flex-col lg:justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-500">Reflexiona</p>
              <p className="text-sm leading-relaxed text-slate-600">
                Toma un momento para meditar y llevar la inspiración del día a cada encuentro con tus pacientes y equipo.
              </p>
              <span className="self-end text-3xl">✨</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
