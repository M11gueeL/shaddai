import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await login(form);
    if (result.success) {
      // redirigir a la página anterior o dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded bg-white shadow">
      <h2 className="text-2xl font-semibold mb-6 text-center">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          value={form.email}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          value={form.password}
          required
        />
        {error && <div className="text-red-600">{error}</div>}
        <button
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          type="submit"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
