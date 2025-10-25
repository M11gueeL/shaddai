import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../api/authApi"; // Importamos la nueva función

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // Para el mensaje de éxito
  const [loading, setLoading] = useState(false);
  
  // Estados para el fadeOut, igual que en tu Login
  const [errorFadeOut, setErrorFadeOut] = useState(false);
  const [messageFadeOut, setMessageFadeOut] = useState(false);
  const displayDuration = 5000; // 5 segundos para el mensaje de éxito
  const fadeDuration = 500;

  // Efecto para el error
  useEffect(() => {
    if (!error) return;
    const fadeTimer = setTimeout(() => setErrorFadeOut(true), displayDuration - fadeDuration);
    const clearTimer = setTimeout(() => { setError(null); setErrorFadeOut(false); }, displayDuration);
    return () => { clearTimeout(fadeTimer); clearTimeout(clearTimer); };
  }, [error]);

  // Efecto para el mensaje de éxito
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
      // Usamos la nueva función del API
      const response = await requestPasswordReset(email);
      setMessage(response.data.message);
      setEmail(""); // Limpiamos el input
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error al enviar la solicitud.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            {/* Icono de Email */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Recuperar Contraseña</h1>
          <p className="text-gray-600 mt-2">Ingresa tu correo para recibir instrucciones</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    onChange={handleChange}
                    value={email}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Mensaje de Error (Rojo) */}
              {error && (
                  <div
                    className={`
                      bg-red-50 border border-red-200 rounded-lg p-4
                      transition-opacity duration-500
                      ${errorFadeOut ? "opacity-0" : "opacity-100"}
                    `}
                  >
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
              )}

              {/* Mensaje de Éxito (Verde) */}
              {message && (
                  <div
                    className={`
                      bg-green-50 border border-green-200 rounded-lg p-4
                      transition-opacity duration-500
                      ${messageFadeOut ? "opacity-0" : "opacity-100"}
                    `}
                  >
                    <p className="text-sm text-green-700">{message}</p>
                  </div>
              )}

              <div>
                <button
                  disabled={loading || message} // Deshabilitado si carga o si ya tuvo éxito
                  className={`w-full py-3.5 px-4 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 ${
                    loading || message
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed" 
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  }`}
                  type="submit"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Enviar Instrucciones
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
             <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500 transition font-medium">
                Volver a Iniciar Sesión
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}