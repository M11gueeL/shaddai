import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import { getRecaptchaSiteKey } from "../../api/authApi";

export default function Login() {
  const currentYear = new Date().getFullYear();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [siteKey, setSiteKey] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const captchaRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const requiresCaptcha = Boolean(siteKey);

  const displayDuration = 3000;
  const fadeDuration = 500;

  useEffect(() => {
    if (!error) return;

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, displayDuration - fadeDuration);

    const clearTimer = setTimeout(() => {
      setError(null);
      setFadeOut(false);
    }, displayDuration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(clearTimer);
    };
  }, [error]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await getRecaptchaSiteKey();
        if (!active) return;
        setSiteKey(response.data?.site_key || "");
      } catch (fetchError) {
        if (!active) return;
        setSiteKey("");
      } finally {
        if (active) {
          setCaptchaLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setRecaptchaToken(null);
    if (captchaRef.current) {
      captchaRef.current.reset();
    }
  }, [siteKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (requiresCaptcha && !recaptchaToken) {
      setError("Por favor completa el reCAPTCHA.");
      return;
    }
    const result = await login({ ...form, recaptchaToken });
    if (result.success) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } else {
      setError(result.message);
      if (requiresCaptcha) {
        if (captchaRef.current) {
          captchaRef.current.reset();
        }
        setRecaptchaToken(null);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* SECCIÓN IZQUIERDA - BRANDING & MENSAJE (Visible en Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 flex-col justify-center items-center text-white overflow-hidden h-screen top-0">
        {/* Fondos Decorativos Abstractos */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay opacity-20 z-0"></div>
        
        {/* Orbes de luz decorativos */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-10 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-10 animate-pulse delay-1000"></div>

        <div className="relative z-20 px-12 max-w-xl text-center">
          {/* Logo Container con efecto Glass */}
          <div className="mb-8 inline-block p-5 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 transform hover:scale-105 transition-transform duration-500">
            <img 
              src="/shaddai_logo.png" 
              alt="Shaddai Logo" 
              className="h-20 w-auto drop-shadow-xl" 
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
            Bienvenido a Shaddai Rafa
          </h1>
          <p className="text-base text-indigo-100 mb-8 font-light">
            Excelencia médica con propósito divino.
          </p>

          {/* Tarjeta del Versículo */}
          <div className="relative p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border-t border-l border-white/20 shadow-xl">
            <p className="text-lg italic font-serif leading-relaxed text-white px-2">
              "Jehová es mi fortaleza y mi escudo;
                En él confió mi corazón, y fui ayudado,
                Por lo que se gozó mi corazón,
                Y con mi cántico le alabaré."
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="h-px w-6 bg-indigo-300"></div>
              <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Salmos 28:7</span>
              <div className="h-px w-6 bg-indigo-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA - FORMULARIO COMPACTO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative">
        <div className="w-full max-w-md space-y-6"> 
          
          <div className="text-center lg:text-left space-y-1">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Iniciar Sesión</h2>
            <p className="text-gray-500 text-base">Ingresa tus credenciales para acceder.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5"> {/* Reduce space-y-6 a space-y-5 */}
            <div className="space-y-4"> {/* Agrupa inputs más cerca */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 ml-1 group-focus-within:text-indigo-600 transition-colors">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="tu@email.com"
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-300 ease-in-out" 
                    onChange={handleChange}
                    value={form.email}
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1 group-focus-within:text-indigo-600 transition-colors">Contraseña</label>
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
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-300 ease-in-out"
                    onChange={handleChange}
                    value={form.password}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer group-hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer transition-all"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 select-none cursor-pointer hover:text-gray-900">
                  Recordarme
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  ¿Olvidaste contraseña?
                </Link>
              </div>
            </div>

            {error && (
              <div
                className={`
                  bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg
                  transform transition-all duration-500 ease-out
                  ${fadeOut ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}
                `}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-1">
              {captchaLoading ? (
                <div className="flex justify-center p-2">
                  <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              ) : requiresCaptcha ? (
                <div className="flex justify-center transform scale-90 sm:scale-100 origin-center transition-transform">
                  <ReCAPTCHA
                    ref={captchaRef}
                    sitekey={siteKey}
                    onChange={(value) => {
                      setRecaptchaToken(value);
                      if (error) setError(null);
                    }}
                    onExpired={() => setRecaptchaToken(null)}
                  />
                </div>
              ) : null}
            </div>

            <button
              disabled={loading || captchaLoading || (requiresCaptcha && !recaptchaToken)}
              className={`
                w-full py-3 px-6 rounded-xl text-white font-semibold text-lg shadow-lg tracking-wide
                transition-all duration-300 transform hover:-translate-y-1 hover:shadow-indigo-500/30
                focus:outline-none focus:ring-4 focus:ring-indigo-500/50
                ${
                  loading || captchaLoading || (requiresCaptcha && !recaptchaToken)
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right"
                }
              `}
              type="submit"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verificando...</span>
                </span>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 font-medium">
              © {currentYear} Centro de Especialidades Médicas Shaddai Rafa.
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}