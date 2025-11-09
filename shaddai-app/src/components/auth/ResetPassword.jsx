import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../api/authApi"; // Importamos la nueva función

export default function ResetPassword() {
  const { token } = useParams(); // Obtenemos el token de la URL
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const displayDuration = 3000;
  const fadeDuration = 500;

  // Efecto para el error
  useEffect(() => {
    if (!error) return;
    const fadeTimer = setTimeout(() => setFadeOut(true), displayDuration - fadeDuration);
    const clearTimer = setTimeout(() => { setError(null); setFadeOut(false); }, displayDuration);
    return () => { clearTimeout(fadeTimer); clearTimeout(clearTimer); };
  }, [error]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validación de frontend
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(token, form.password);
      setMessage(response.data.message + ". Serás redirigido...");

      // Redirigimos al Login después del éxito
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);

    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error al restablecer la contraseña.";
      setError(errorMsg);
      setLoading(false); // Solo paramos de cargar en error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            {/* Icono de Llave */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h1V7a2 2 0 012-2h1V3a2 2 0 012 2v1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Crear Nueva Contraseña</h1>
          <p className="text-gray-600 mt-2">Por favor ingresa tu nueva contraseña</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    onChange={handleChange}
                    value={form.password}
                    required
                    disabled={loading || message}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || message}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Repite la contraseña"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    onChange={handleChange}
                    value={form.confirmPassword}
                    required
                    disabled={loading || message}
                  />
                </div>
              </div>

              {error && (
                  <div
                    className={`
                      bg-red-50 border border-red-200 rounded-lg p-4
                      transition-opacity duration-500
                      ${fadeOut ? "opacity-0" : "opacity-100"}
                    `}
                  >
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
              )}

              {message && (
                  <div
                    className={`
                      bg-green-50 border border-green-200 rounded-lg p-4
                      transition-opacity duration-500
                    `}
                  >
                    <p className="text-sm text-green-700">{message}</p>
                  </div>
              )}

              <div>
                <button
                  disabled={loading || message}
                  className={`w-full py-3.5 px-4 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 ${
                    loading || message
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed" 
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  }`}
                  type="submit"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      Actualizando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar Contraseña
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
             <Link to="/login" className="text-xs text-indigo-600 hover:text-indigo-500 transition font-medium">
                Volver a Iniciar Sesión
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}