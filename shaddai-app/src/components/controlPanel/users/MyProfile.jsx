import React from "react";

export default function MyProfile({ profile }) {
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

  return (
    <div className="max-w-8xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h1>
              <p className="text-indigo-100">{profile.roles.join(", ")}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="bg-white text-indigo-600 py-1 px-3 rounded-full text-sm font-medium">
                {profile.cedula}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileSection title="Información Personal">
              <InfoItem label="Nombre completo" value={`${profile.first_name} ${profile.last_name}`} />
              <InfoItem label="Fecha de nacimiento" value={profile.birth_date} />
              <InfoItem label="Género" value={profile.gender} />
              <InfoItem label="Email" value={profile.email} />
            </ProfileSection>

            <ProfileSection title="Contacto">
              <InfoItem label="Teléfono" value={profile.phone} />
              <InfoItem label="Dirección" value={profile.address} />
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
const ProfileSection = ({ title, children }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

// InfoItem mejorado con mejor separación visual
const InfoItem = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start">
    <div className="text-gray-500 font-medium w-full sm:w-1/3 mb-1 sm:mb-0">{label}:</div>
    <div className="font-medium text-gray-800 w-full sm:w-2/3">{value || 'N/A'}</div>
  </div>
);