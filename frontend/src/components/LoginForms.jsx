import { useState, useEffect } from "react";
import { loginUser, registerUser, recoverPassword } from "../services/authService";
import maxImage from "../assets/max.webp";

export default function LoginForms({ onLoginSuccess }) {
  // Estado para alternar entre Iniciar Sesión y Registro
  const [isRegister, setIsRegister] = useState(false);

  // Estados del Formulario de Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Estados del Formulario de Registro
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados de carga, error y éxito
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para mostrar/ocultar contraseñas
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Efecto visual de entrada original

  useEffect(() => {

    const elements = document.querySelectorAll('.animate-fade-in-up');
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px)';
      setTimeout(() => {
        el.style.transition = 'all 0.5s ease-out';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 80 * index);
    });
  }, [isRegister]);

  // Manejar el envío de Login
  const handleLoginSubmit = async (e) => {

    e.preventDefault();
    setError("");
    setSuccess("");

    // Validación de formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(loginEmail)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginUser(loginEmail, loginPassword);
      setSuccess("¡Ingreso Exitoso!");
      
      if (data.session && data.session.access_token) {
        localStorage.setItem("token", data.session.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Notificar al componente padre de la autenticación exitosa
        setTimeout(() => {
          onLoginSuccess(data.session.access_token);
        }, 1000);
      }
      
      setLoginEmail("");
      setLoginPassword("");
    } catch (err) {
      setError(err.message || "Usuario o contraseña inválidos.");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar el envío de Registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    //  Validación de nombre completo: al menos un nombre y un apellido
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,}(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,})+$/;
    if (!nameRegex.test(nombreCompleto.trim())) {
      setError("El nombre completo debe incluir al menos un nombre y un apellido.");
      return;
    }

    //  Validación de formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(registerEmail)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    //  Validación de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(registerPassword)) {
      setError("La contraseña debe tener al menos 6 caracteres, incluir una letra mayúscula, una minúscula y un número.");
      return;
    }

    //  Confirmación de contraseña
    if (registerPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(registerEmail, registerPassword, nombreCompleto);
      setSuccess("¡Registro Exitoso! Redirigiendo al login...");
      
      setNombreCompleto("");
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");

      // Deslizar de vuelta al login automáticamente
      setTimeout(() => {
        setIsRegister(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Ocurrió un error al registrarse.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#fdf9f4] text-[#1c1c19] min-h-screen flex flex-col overflow-x-hidden selection:bg-[#ffdad3]">
      {/* Estilos del slider embebidos directamente en el componente */}
      <style>{`
        .card-slider-container {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .card-slider-wrapper {
          display: flex;
          width: 200%;
          transition: transform 0.6s cubic-bezier(0.76, 0, 0.24, 1);
        }

        .card-slider-pane {
          width: 50%;
          flex-shrink: 0;
          box-sizing: border-box;
          padding: 2rem;
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&family=Nunito+Sans:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

      {/* Cabecera */}
      <header className="bg-[#fdf9f4]/90 backdrop-blur-md shadow-sm shadow-[#9d3d2c]/5 top-0 z-50 sticky">
        <div className="flex justify-between items-center w-full px-5 md:px-16 max-w-[1280px] mx-auto h-16">
          <div className="text-2xl md:text-3xl text-[#9d3d2c] tracking-tight font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>
            Huellas UIO
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }} href="#">Encuentra una mascota</a>
            <a className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }} href="#">Como funciona</a>
            <a className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }} href="#">Nuestros refugios</a>
            <a className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }} href="#">Historias</a>
          </nav>
          <button className="bg-[#9d3d2c] text-white px-6 py-1.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            Help
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="flex flex-col md:flex-row overflow-hidden min-h-[calc(100vh-64px)]">
          
          {/* LADO IZQUIERDO: Tarjeta de Autenticación con deslizamiento interno */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-[#ffffff] relative z-10">
            <div className="max-w-md w-full animate-fade-in-up bg-white/50 rounded-3xl shadow-xl shadow-[#9d3d2c]/5 border border-[#ddc0bb]/30 overflow-hidden">
              <div className="card-slider-container">
                <div className="card-slider-wrapper" style={{ transform: isRegister ? "translateX(-50%)" : "translateX(0)" }}>
                  
                  {/* PANEL DE LOGIN */}
                  <div className="card-slider-pane">
                    <div className="mb-6">
                      <h1 className="text-2xl text-[#9d3d2c] mb-2 tracking-tight font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>INICIAR SESIÓN</h1>
                    </div>

                    {error && !isRegister && (
                      <div className="mb-4 p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-rose-600">error_outline</span>
                        {error}
                      </div>
                    )}

                    {success && !isRegister && (
                      <div className="mb-4 p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
                        {success}
                      </div>
                    )}

                    <form className="space-y-4" onSubmit={handleLoginSubmit}>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Correo electrónico</label>
                          <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors text-lg">mail</span>
                            <input 
                              className="w-full pl-11 pr-4 py-2.5 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none text-sm" 
                              placeholder="nombre@ejemplo.com" 
                              type="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Contraseña</label>
                          <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors text-lg">lock</span>
                            <input 
                              className="w-full pl-11 pr-10 py-2.5 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none text-sm" 
                              placeholder="Contraseña" 
                              type={showLoginPassword ? "text" : "password"}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#89726d] hover:text-[#9d3d2c] transition-colors focus:outline-none flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-lg">
                                {showLoginPassword ? "visibility" : "visibility_off"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold py-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input className="w-4 h-4 rounded border-[#89726d] text-[#9d3d2c] focus:ring-[#9d3d2c] focus:ring-offset-0 transition-all" type="checkbox" />
                          <span className="text-[#56423e] group-hover:text-[#9d3d2c] transition-colors">Recordarme</span>
                        </label>
                        <a
                          className="text-[#9d3d2c] hover:text-[#802919] transition-all"
                          href="#"
                          onClick={async (e) => {
                            e.preventDefault();
                            setError("");
                            setSuccess("");

                            const trimmedEmail = loginEmail.trim();
                            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                            if (!trimmedEmail) {
                              setError("Por favor ingresa tu correo para recuperar la contraseña.");
                              return;
                            }
                            if (!emailRegex.test(trimmedEmail)) {
                              setError("Por favor ingresa un correo electrónico válido.");
                              return;
                            }

                            setIsLoading(true);
                            try {
                              await recoverPassword(trimmedEmail);
                              setSuccess("Revisa tu correo: si existe tu cuenta, te enviaremos un enlace para recuperar tu contraseña.");
                            } catch (err) {
                              setError(err.message || "No se pudo iniciar la recuperación de contraseña.");
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                        >
                          ¿Olvidaste tu contraseña?
                        </a>
                      </div>

                      <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] text-white rounded-full font-bold shadow-lg shadow-[#9d3d2c]/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                        {isLoading ? "Iniciando sesión..." : "INICIAR SESIÓN"}
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                    </form>

                    <div className="mt-6 text-center" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                      <div className="flex items-center gap-4 my-4">
                        <div className="h-px flex-1 bg-[#ddc0bb]/70"></div>
                        <p className="text-[10px] font-bold text-[#89726d] uppercase tracking-widest">Iniciar sesión con</p>
                        <div className="h-px flex-1 bg-[#ddc0bb]/70"></div>
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                        <button type="button" className="w-full py-2.5 bg-white border border-[#ddd9d5] rounded-full flex items-center justify-center gap-2 hover:bg-[#f7f3ee] transition-all group">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.336 0 3.327 2.745 1.455 6.745l3.81 3.02z"/>
                            <path fill="#4285F4" d="M23.455 12.273c0-.818-.082-1.609-.218-2.373H12v4.582h6.427a5.57 5.57 0 0 1-2.409 3.655v3h3.873c2.264-2.09 3.564-5.173 3.564-8.864z"/>
                            <path fill="#FBBC05" d="M5.266 14.235A7.09 7.09 0 0 1 4.909 12c0-.79.13-1.545.357-2.235L1.455 6.745A11.93 11.93 0 0 0 0 12c0 1.927.455 3.736 1.255 5.373l4.01-3.138z"/>
                            <path fill="#34A853" d="M12 24c3.245 0 5.973-1.073 7.964-2.91l-3.873-3c-1.082.727-2.473 1.155-4.09 1.155-3.164 0-5.845-2.136-6.809-5.018l-4.01 3.136C3.127 21.236 7.155 24 12 24z"/>
                          </svg>
                          <span className="font-sans font-bold text-xs text-[#1c1c19]">Continuar con Google</span>
                        </button>
                        <button type="button" className="w-full py-2.5 bg-white border border-[#ddd9d5] rounded-full flex items-center justify-center gap-2 hover:bg-[#f7f3ee] transition-all group">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span className="font-sans font-bold text-xs text-[#1c1c19]">Continuar con Facebook</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PANEL DE REGISTRO */}
                  <div className="card-slider-pane">
                    <div className="mb-6">
                      <h1 className="text-2xl text-[#9d3d2c] mb-2 tracking-tight font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>REGISTRARSE</h1>
                    </div>

                    {error && isRegister && (
                      <div className="mb-4 p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-rose-600">error_outline</span>
                        {error}
                      </div>
                    )}

                    {success && isRegister && (
                      <div className="mb-4 p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
                        {success}
                      </div>
                    )}

                    <form className="space-y-3" onSubmit={handleRegisterSubmit}>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Nombre completo</label>
                          <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors text-lg">person</span>
                            <input 
                              className="w-full pl-11 pr-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none text-sm" 
                              placeholder="Tu nombre completo" 
                              type="text"
                              value={nombreCompleto}
                              onChange={(e) => setNombreCompleto(e.target.value)}
                              required
                              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Correo electrónico</label>
                          <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors text-lg">mail</span>
                            <input 
                              className="w-full pl-11 pr-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none text-sm" 
                              placeholder="nombre@ejemplo.com" 
                              type="email"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              required
                              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Contraseña</label>
                          <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors text-lg">lock</span>
                            <input 
                              className="w-full pl-11 pr-10 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none text-sm" 
                              placeholder="Mínimo 6 caracteres" 
                              type={showRegisterPassword ? "text" : "password"}
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              required
                              minLength={6}
                              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#89726d] hover:text-[#9d3d2c] transition-colors focus:outline-none flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-lg">
                                {showRegisterPassword ? "visibility" : "visibility_off"}
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Confirmar contraseña</label>
                          <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors text-lg">lock_reset</span>
                            <input 
                              className="w-full pl-11 pr-10 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none text-sm" 
                              placeholder="Repita la contraseña" 
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#89726d] hover:text-[#9d3d2c] transition-colors focus:outline-none flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-lg">
                                {showConfirmPassword ? "visibility" : "visibility_off"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] text-white rounded-full font-bold shadow-lg shadow-[#9d3d2c]/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                        {isLoading ? "Creando cuenta..." : "CREAR CUENTA"}
                        <span className="material-symbols-outlined text-lg">person_add</span>
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Banner interactivo */}
          <div className="w-full md:w-1/2 min-h-[400px] md:min-h-full relative overflow-hidden bg-[#9d3d2c] flex items-center justify-center">
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#bd5541]/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-5%] left-[20%] w-[300px] h-[300px] bg-[#c7aa16]/20 rounded-full blur-[80px]"></div>

            <div className="absolute inset-y-0 left-0 w-24 bg-white hidden md:block" style={{ clipPath: "polygon(0 0, 100% 0, 40% 10%, 100% 25%, 30% 45%, 100% 65%, 45% 85%, 100% 100%, 0 100%)" }}></div>

            <div className="relative h-full flex flex-col items-center justify-center text-center p-8 text-[#fffbff] z-20">
              <div className="mb-4 p-3 bg-white/10 rounded-full backdrop-blur-sm shadow-xl">
                <span className="material-symbols-outlined text-[36px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isRegister ? "login" : "pets"}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl mb-4 leading-tight font-bold transition-all duration-300" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                {isRegister ? "¡Bienvenido de nuevo!" : "¡Encantado de conocerte!"}
              </h2>
              
              <p className="text-sm md:text-base max-w-sm mb-6 text-white/90 transition-all duration-300 leading-relaxed" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                {isRegister 
                  ? "Para mantenerte conectado con nosotros, por favor inicia sesión con tu cuenta personal."
                  : "Únete a nuestra comunidad de corazones compasivos. Cada mascota merece un hogar cálido y una familia que ame."
                }
              </p>
              
              <button 
                onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}
                className="px-10 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full font-bold text-xs border-2 border-white/50 hover:scale-[1.05] active:scale-95 transition-all" 
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                {isRegister ? "INICIAR SESIÓN" : "REGISTRARSE"}
              </button>

              <div className="mt-8 pt-4 border-t border-white/10 w-full max-w-xs" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                <p className="text-[10px] font-bold text-white/70 mb-3">{isRegister ? "o inicia sesión con" : "o regístrate con"}</p>
                <div className="flex justify-center gap-4">
                  {/* Google */}
                  <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 1.192 15.34 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.19-1.925H12.24z"/>
                    </svg>
                  </button>
                  {/* Facebook */}
                  <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <img
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
              alt="Mascota Max"
              src={maxImage}
            />
          </div>
        </section>
      </main>
    </div>
  );
}