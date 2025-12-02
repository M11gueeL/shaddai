import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [errorFadeOut, setErrorFadeOut] = useState(false);
  const [messageFadeOut, setMessageFadeOut] = useState(false);
  const displayDuration = 5000;
  const fadeDuration = 500;

  useEffect(() => {
    if (!error) return;
    const fadeTimer = setTimeout(() => setErrorFadeOut(true), displayDuration - fadeDuration);
    const clearTimer = setTimeout(() => { setError(null); setErrorFadeOut(false); }, displayDuration);
    return () => { clearTimeout(fadeTimer); clearTimeout(clearTimer); };
  }, [error]);

  useEffect(() => {
    if (!message) return;
    const fadeTimer = setTimeout(() => setMessageFadeOut(true), displayDuration - fadeDuration);
    const clearTimer = setTimeout(() => { setMessage(null); setMessageFadeOut(false); }, displayDuration);
    return () => { clearTimeout(fadeTimer); clearTimeout(clearTimer); };
  }, [message]);

  const handleChange = (e) => setEmail(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    
    try {
      const response = await requestPasswordReset(email);
      setMessage(response.data.message);
      setEmail("");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error al enviar la solicitud.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* SECCIÓN IZQUIERDA - BRANDING (Visible en Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 flex-col justify-center items-center text-white overflow-hidden h-screen top-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay opacity-20 z-0"></div>
        
        {/* Decoración */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-10 animate-pulse"></div>

        <div className="relative z-20 px-12 max-w-xl text-center">
          <div className="mb-8 inline-block p-5 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
            <img src="/shaddai_logo.png" alt="Shaddai Logo" className="h-20 w-auto drop-shadow-xl" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
            Recuperación de Cuenta
          </h1>
          
          <div className="relative p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border-t border-l border-white/20 shadow-xl mt-8">
            <p className="text-lg italic font-serif leading-relaxed text-white px-2">
              "Busqué a Jehová, y él me oyó, y me libró de todos mis temores."
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="h-px w-6 bg-indigo-300"></div>
              <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Salmos 34:4</span>
              <div className="h-px w-6 bg-indigo-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA - FORMULARIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center lg:text-left space-y-1">
             {/* Botón Volver más visible y estilizado */}
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-all duration-300 mb-6 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a Iniciar Sesión
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">¿Olvidaste tu contraseña?</h2>
            <p className="text-gray-500 text-base">No te preocupes, te enviaremos las instrucciones.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 ml-1 group-focus-within:text-indigo-600 transition-colors">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="tu@email.com"
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-300 ease-in-out"
                    onChange={handleChange}
                    value={email}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className={`bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg transform transition-all duration-500 ease-out ${errorFadeOut ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {message && (
              <div className={`bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg transform transition-all duration-500 ease-out ${messageFadeOut ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
                <p className="text-sm text-green-700 font-medium">{message}</p>
              </div>
            )}

            <button
              disabled={loading || message}
              className={`
                w-full py-3 px-6 rounded-xl text-white font-bold text-lg shadow-lg tracking-wide
                transition-all duration-300 transform hover:-translate-y-1 hover:shadow-indigo-500/30
                focus:outline-none focus:ring-4 focus:ring-indigo-500/50
                ${loading || message ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right"}
              `}
              type="submit"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   <span>Enviando...</span>
                </span>
              ) : (
                "Enviar Instrucciones"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 font-medium">© 2025 Centro de Especialidades Médicas Shaddai Rafa.</p>
            <p className="text-xs text-gray-400 font-medium ">
              Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}