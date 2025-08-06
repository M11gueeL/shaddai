import React, { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
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
      
      // Asegurar que roles sea siempre un array
      const userData = {
        ...res.data.user,
        roles: Array.isArray(res.data.user.roles) 
          ? res.data.user.roles 
          : [res.data.user.roles]
      };
      
      setUser(userData);
      setToken(res.data.token);
      setSessionId(res.data.session_id);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      let message = "Error desconocido";
      if (error.response) {
        message = error.response.data?.error || error.response.data?.message || message;
      }
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
  };

  const isAuthenticated = !!token;

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