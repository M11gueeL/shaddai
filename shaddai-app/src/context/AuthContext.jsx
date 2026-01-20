import React, { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../api/authApi";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const toast = useToast();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem("session_id") || null);
  const [loading, setLoading] = useState(false);

  // Función para verificar permisos
  const hasRole = (requiredRoles) => {
    if (!user || !user.roles) return false;
    
    // Admin tiene acceso completo
    if (user.roles.includes('admin')) return true;
    
    // Verificar si tiene al menos uno de los roles requeridos
    return requiredRoles.some(role => user.roles.includes(role));
  };

  useEffect(() => {
    if (user && token && sessionId) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("session_id", sessionId);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("session_id");
    }
  }, [user, token, sessionId]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authApi.login(credentials);

      const tokenFromLogin = res.data.token;

      localStorage.setItem("token", tokenFromLogin); 
      localStorage.setItem("session_id", res.data.session_id);
      localStorage.setItem("user", JSON.stringify({
        ...res.data.user,
        roles: Array.isArray(res.data.user.roles) ? res.data.user.roles : [res.data.user.roles]
      }));

      const baseUser = {
        ...res.data.user,
        roles: Array.isArray(res.data.user.roles)
          ? res.data.user.roles
          : [res.data.user.roles],
      };

      // Guardar de inmediato para tener sesión activa
      setUser(baseUser);
      setToken(tokenFromLogin);
      setSessionId(res.data.session_id);

      // Intentar enriquecer con el perfil completo (nombre, apellido, género, etc.)
      try {
        const profileRes = await authApi.getProfile();
        const profile = profileRes.data || {};
        const merged = {
          ...baseUser,
          ...profile,
          roles: Array.isArray(profile.roles) ? profile.roles : baseUser.roles,
        };
        localStorage.setItem("user", JSON.stringify(merged));
        setUser(merged);
        
        // Notificación de bienvenida
        const hour = new Date().getHours();
        let greeting = "Buenos días";
        if (hour >= 12 && hour < 19) greeting = "Buenas tardes";
        else if (hour >= 19 || hour < 6) greeting = "Buenas noches";
        
        const userName = merged.first_name || merged.name || merged.username || "Usuario";
        toast.success(`${greeting}, bienvenido ${userName}!`);
        
      } catch (e) {
        // Si falla, mantenemos el baseUser sin romper el flujo
        console.warn("No se pudo cargar el perfil completo:", e?.response?.data || e?.message);
        
        // Notificación básica si falla el perfil
        toast.success("Bienvenido al sistema");
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      let message = "Error desconocido";
      if (error.response) {
        message = error.response.data?.error || error.response.data?.message || message;
      }
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await authApi.logout(token);
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
      }
    }
    setUser(null);
    setToken(null);
    setSessionId(null);
    toast.success("Hasta luego, sesión cerrada con éxito");
  };

  const isAuthenticated = !!token;

  // Cargar/Refrescar perfil si ya hay token y faltan nombres en user
  useEffect(() => {
    const needsProfile = token && (!user || (!user.first_name && !user.firstName && !user.name));
    if (!needsProfile) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.getProfile(token);
        if (cancelled) return;
        const profile = res.data || {};
        const merged = {
          ...(user || {}),
          ...profile,
          roles: Array.isArray(profile.roles) ? profile.roles : (user?.roles || []),
        };
        setUser(merged);
      } catch (e) {
        console.warn("No se pudo refrescar el perfil:", e?.response?.data || e?.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      sessionId, 
      login, 
      logout, 
      isAuthenticated, 
      loading,
      hasRole // Exportar la función de verificación
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);