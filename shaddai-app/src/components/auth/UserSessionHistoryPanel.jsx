import React from "react";

export default function UserSessionHistoryPanel({ sessions }) {
  if (!sessions) return <p>Cargando sesiones...</p>;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-bold mb-4">Sesiones</h3>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">ID Usuario</th>
            <th className="border px-4 py-2">Email Usuario</th>
            <th className="border px-4 py-2">IP</th>
            <th className="border px-4 py-2">Dispositivo</th>
            <th className="border px-4 py-2">Ingreso</th>
            <th className="border px-4 py-2">Estado</th>
            <th className="border px-4 py-2">Logout</th>
          </tr>
        </thead>
        <tbody>
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <tr key={s.id}>
                <td className="border px-4 py-1 break-all">{s.id}</td>
                <td className="border px-4 py-1 break-all">{s.user_id}</td>
                <td className="border px-4 py-1">{s.email}</td>
                <td className="border px-4 py-1">{s.ip_address}</td>
                <td className="border px-4 py-1">{s.device_info}</td>
                <td className="border px-4 py-1">{s.login_time}</td>
                <td className="border px-4 py-1">{s.session_status}</td>
                <td className="border px-4 py-1">{s.logout_time || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4">No hay sesiones.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
