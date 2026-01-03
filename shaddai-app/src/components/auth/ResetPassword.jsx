import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../api/authApi";

export default function ResetPassword() {
  const currentYear = new Date().getFullYear();
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const displayDuration = 3000;
  const fadeDuration = 500;

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
      setMessage(response.data.message + ". Redirigiendo...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error al restablecer la contraseña.";
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* SECCIÓN IZQUIERDA - BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 flex-col justify-center items-center text-white overflow-hidden h-screen top-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay opacity-20 z-0"></div>
        
        {/* Decoración */}
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-10 animate-pulse"></div>

        <div className="relative z-20 px-12 max-w-xl text-center">
          <div className="mb-8 inline-block p-5 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
            <img src="/shaddai_logo.png" alt="Shaddai Logo" className="h-20 w-auto drop-shadow-xl" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
            Seguridad Renovada
          </h1>
          
          <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border-t border-l border-white/20 shadow-xl mt-8">
            <div className="space-y-4 px-2">
              <p className="text-lg italic font-serif leading-relaxed text-white"> 
                "Por la misericordia del SEÑOR no hemos sido consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad."
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="h-px w-6 bg-indigo-300"></div>
              <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Lamentaciones 3:22-23</span>
              <div className="h-px w-6 bg-indigo-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA - FORMULARIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left space-y-1">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Crear una Nueva Contraseña</h2>
            <p className="text-gray-500 text-base">Asegura tu cuenta con una clave fuerte.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1 group-focus-within:text-indigo-600 transition-colors">Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Mínimo 8 caracteres"
                    className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-300 ease-in-out"
                    onChange={handleChange}
                    value={form.password}
                    required
                    disabled={loading || message}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer group-hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || message}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-indigo-600 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-indigo-600 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 ml-1 group-focus-within:text-indigo-600 transition-colors">Confirmar Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Repite la contraseña"
                    className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-300 ease-in-out"
                    onChange={handleChange}
                    value={form.confirmPassword}
                    required
                    disabled={loading || message}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className={`bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg transform transition-all duration-500 ease-out ${fadeOut ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
                <p className="text-sm text-green-700 font-medium">{message}</p>
              </div>
            )}

            <button
              disabled={loading || message}
              className={`
                w-full py-3 px-6 rounded-xl text-white font-semibold text-lg shadow-lg tracking-wide
                transition-all duration-300 transform hover:-translate-y-1 hover:shadow-indigo-500/30
                focus:outline-none focus:ring-4 focus:ring-indigo-500/50
                ${loading || message ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right"}
              `}
              type="submit"
            >
              {loading ? (
                <span className="flex items-center justify-center">Actualizando...</span>
              ) : (
                "Guardar Nueva Contraseña"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 font-medium">© {currentYear} Centro de Especialidades Médicas Shaddai Rafa.</p>
            <p className="text-xs text-gray-400 font-medium">
              Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}