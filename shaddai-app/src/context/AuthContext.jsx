import React, { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem("session_id") || null);
  const [loading, setLoading] = useState(false);

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
      setUser(res.data.user);
      setToken(res.data.token);
      setSessionId(res.data.session_id);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      let message = "Error desconocido";
      if (error.response) {
        if (error.response.data?.error) {
          message = error.response.data.error;
        } else if (error.response.data?.message) {
          message = error.response.data.message;
        }
      }
      return { success: false, message };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await authApi.logout(token);
      } catch (err) {
        // No importa, puede fallar si ya expiró
      }
    }
    setUser(null);
    setToken(null);
    setSessionId(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, sessionId, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
