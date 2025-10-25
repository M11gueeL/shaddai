import React, { useMemo, useState } from "react";
import { User, BadgeCheck, Mail, Copy, Shield, IdCard, Phone, Calendar, MapPin } from "lucide-react";

export default function MyProfile({ profile, sessionId }) {
  if (!profile) return (
    <div className="flex justify-center py-12">
      <div className="animate-pulse flex flex-col space-y-4 w-full max-w-xl">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
  const [copied, setCopied] = useState(null);
  const initials = useMemo(() => {
    const f = (profile.first_name || '').trim();
    const l = (profile.last_name || '').trim();
    return (f[0] || '').toUpperCase() + (l[0] || '').toUpperCase();
  }, [profile.first_name, profile.last_name]);

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch (_) {}
  };

  return (
    <div className="max-w-8xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold ring-2 ring-white/30">
                {initials || <User className="w-6 h-6" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">
                  {profile.first_name} {profile.last_name}
                </h1>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Array.isArray(profile.roles) && profile.roles.map((r, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-white/15 text-white px-2 py-0.5 rounded-full text-xs">
                      <Shield className="w-3 h-3" /> {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {profile.cedula && (
                <button
                  onClick={() => handleCopy(profile.cedula, 'cedula')}
                  className="inline-flex items-center gap-2 bg-white text-indigo-700 py-1.5 px-3 rounded-full text-xs font-semibold hover:bg-indigo-50 transition"
                  title="Copiar cédula"
                >
                  <IdCard className="w-4 h-4" />
                  {profile.cedula}
                  <Copy className={`w-3.5 h-3.5 ${copied === 'cedula' ? 'text-green-600' : 'text-indigo-500'}`} />
                </button>
              )}
              {profile.email && (
                <button
                  onClick={() => handleCopy(profile.email, 'email')}
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white py-1.5 px-3 rounded-full text-xs font-medium hover:bg-white/20 transition"
                  title="Copiar email"
                >
                  <Mail className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{profile.email}</span>
                  <Copy className={`w-3.5 h-3.5 ${copied === 'email' ? 'text-green-300' : 'text-white/80'}`} />
                </button>
              )}
              {profile.phone && (
                <button
                  onClick={() => handleCopy(profile.phone, 'phone')}
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white py-1.5 px-3 rounded-full text-xs font-medium hover:bg-white/20 transition"
                  title="Copiar teléfono"
                >
                  <Phone className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{profile.phone}</span>
                  <Copy className={`w-3.5 h-3.5 ${copied === 'phone' ? 'text-green-300' : 'text-white/80'}`} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Quick summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard label="ID Usuario" value={profile.id} />
            <SummaryCard label="Rol Principal" value={Array.isArray(profile.roles) ? profile.roles[0] : '—'} />
            <SummaryCard label="Email" value={profile.email} clip />
            <SummaryCard label="Teléfono" value={profile.phone || '—'} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileSection title="Información Personal" icon={User}>
              <InfoItem icon={User} label="Nombre completo" value={`${profile.first_name} ${profile.last_name}`} />
              <InfoItem icon={Calendar} label="Fecha de nacimiento" value={profile.birth_date} />
              <InfoItem icon={BadgeCheck} label="Género" value={profile.gender} />
              <InfoItem
                icon={Mail}
                label="Email"
                value={profile.email}
                copy
                copyKey="email"
                onCopy={handleCopy}
                copied={copied}
              />
            </ProfileSection>

            <ProfileSection title="Contacto" icon={Phone}>
              <InfoItem
                icon={Phone}
                label="Teléfono"
                value={profile.phone}
                copy
                copyKey="phone"
                onCopy={handleCopy}
                copied={copied}
              />
              <InfoItem icon={MapPin} label="Dirección" value={profile.address} />
            </ProfileSection>
          </div>

          {profile.medical_info && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Información Médica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Código MPPS" value={profile.medical_info.mpps_code} />
                <InfoItem label="Código Colegio Médico" value={profile.medical_info.college_code} />
              </div>
              
              {profile.specialties?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((s) => (
                      <span 
                        key={s.id} 
                        className="bg-purple-100 text-purple-800 py-1 px-3 rounded-full text-sm"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares actualizados
const ProfileSection = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-gray-200/80 bg-white/70 backdrop-blur p-5 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      {Icon && (
        <div className="w-9 h-9 rounded-full border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5" />
        </div>
      )}
      <h2 className="text-base font-semibold text-gray-800 tracking-tight">{title}</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {children}
    </div>
  </div>
);

// InfoItem modernizado con icono y acción de copiar opcional
const InfoItem = ({ label, value, icon: Icon, copy = false, copyKey, onCopy, copied }) => {
  const hasValue = Boolean(value);
  return (
    <div className="group relative flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition">
      {Icon && (
        <div className="mt-0.5 shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
          <Icon className="w-4.5 h-4.5" />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
        <div className="text-sm font-medium text-gray-900 truncate" title={hasValue ? String(value) : 'N/A'}>
          {hasValue ? value : 'N/A'}
        </div>
      </div>
      {copy && hasValue && typeof onCopy === 'function' && (
        <button
          type="button"
          onClick={() => onCopy(value, copyKey)}
          className="absolute right-2 top-2 inline-flex items-center justify-center p-1.5 rounded-md border border-gray-200 bg-white text-gray-400 hover:text-indigo-600 hover:border-indigo-200 opacity-0 group-hover:opacity-100 transition"
          title={`Copiar ${label.toLowerCase()}`}
        >
          <Copy className={`w-3.5 h-3.5 ${copied === copyKey ? 'text-green-600' : ''}`} />
        </button>
      )}
    </div>
  );
};

// Small summary pill card
const SummaryCard = ({ label, value, clip }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</div>
    <div className={`text-sm font-semibold text-gray-900 ${clip ? 'truncate' : ''}`}>{value || '—'}</div>
  </div>
);