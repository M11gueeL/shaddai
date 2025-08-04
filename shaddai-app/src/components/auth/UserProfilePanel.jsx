import React from "react";

export default function UserProfilePanel({ profile }) {
  if (!profile) return <p>Cargando información de perfil...</p>;

  return (
    <div className="p-4 bg-white rounded shadow max-w-xl">
      <h3 className="text-xl font-bold mb-4">Perfil de Usuario</h3>
      <p><b>Nombre:</b> {profile.first_name} {profile.last_name}</p>
      <p><b>Cédula:</b> {profile.cedula}</p>
      <p><b>Fecha de nacimiento:</b> {profile.birth_date}</p>
      <p><b>Género:</b> {profile.gender}</p>
      <p><b>Dirección:</b> {profile.address}</p>
      <p><b>Teléfono:</b> {profile.phone}</p>
      <p><b>Email:</b> {profile.email}</p>
      <p><b>Roles:</b> {profile.roles.join(", ")}</p>

      {profile.medical_info && (
        <>
          <h4 className="mt-4 font-semibold">Información Médica</h4>
          <p>MPPS Code: {profile.medical_info.mpps_code}</p>
          <p>Código Colegio Médico: {profile.medical_info.college_code}</p>
          <h5 className="mt-2 font-semibold">Especialidades:</h5>
          <ul className="list-disc list-inside">
            {profile.specialties?.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
