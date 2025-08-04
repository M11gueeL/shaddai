import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import * as authApi from "../../api/authApi";

import UserProfilePanel from "../auth/UserProfilePanel";
import UserSessionHistoryPanel from "../auth/UserSessionHistoryPanel";

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!token) return;
    authApi.getProfile(token)
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null));
    authApi.getSessions(token)
      .then((res) => setSessions(res.data))
      .catch(() => setSessions([]));
  }, [token]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-2 px-4 ${activeTab === "profile" 
              ? "border-b-2 border-blue-600 font-semibold text-blue-700"
              : "text-gray-500"}`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`py-2 px-4 ${activeTab === "sessions" 
              ? "border-b-2 border-blue-600 font-semibold text-blue-700"
              : "text-gray-500"}`}
          >
            Sesiones
          </button>
        </div>

        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>

      <div>
        {activeTab === "profile" && <UserProfilePanel profile={profile} />}
        {activeTab === "sessions" && <UserSessionHistoryPanel sessions={sessions} />}
      </div>
    </div>
  );
}
