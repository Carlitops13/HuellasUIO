import { useState, useEffect } from "react";
import { getProfile, updateProfile, updatePassword, logoutUser } from "../services/authService";
import maxImage from "../assets/max.webp";

export default function UserProfile({ token, onLogout }) {
  // Estados del Perfil del Usuario
  const [perfil, setPerfil] = useState(null);
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  
  // Estados de carga, error y éxito
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados de editar perfil y contraseña
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isProfilePending, setIsProfilePending] = useState(false);

  // Estados para cambiar contraseña
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Cargar usuario del localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Cargar perfil desde la base de datos
  const fetchPerfil = async (authToken) => {
    setIsProfileLoading(true);
    setError("");
    try {
      const data = await getProfile(authToken);
      setPerfil(data);
      setTelefono(data.telefono || "");
      setDireccion(data.direccion || "");
      setNombreCompleto(data.nombre_completo || "");
      
      if (!data.telefono || !data.direccion || !data.perfil_completado) {
        setIsProfilePending(true);
      } else {
        setIsProfilePending(false);
      }
    } catch (err) {
      console.error("Error al cargar perfil:", err);
      setError("No se pudo cargar el perfil de usuario. Inténtalo de nuevo.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPerfil(token);
    }
  }, [token]);

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
  }, [isProfileLoading, isEditingProfile, isEditingPassword, isProfilePending]);

  // Manejar actualización del Perfil
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isEditingProfile) {
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,}(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,})+$/;
      if (!nameRegex.test(nombreCompleto.trim())) {
        setError("El nombre debe incluir al menos un nombre y un apellido.");
        return;
      }
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(telefono)) {
      setError("El teléfono debe tener 10 dígitos numéricos.");
      return;
    }

    if (direccion.trim().length < 10) {
      setError("La dirección debe detallar al menos 10 caracteres (ej: calle principal y secundaria).");
      return;
    }

    setIsLoading(true);

    try {
      const data = await updateProfile(
        {
          nombre_completo: isEditingProfile ? nombreCompleto : (perfil?.nombre_completo || user?.user_metadata?.full_name || ""),
          telefono,
          direccion,
          perfil_completado: true
        },
        token
      );
      
      setSuccess("Perfil guardado con éxito.");
      setPerfil(data.perfil);
      setIsProfilePending(false);
      setIsEditingProfile(false);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Error al actualizar el perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar actualización de contraseña
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError("Por favor, ingresa tu contraseña antigua.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("La contraseña debe tener al menos 6 caracteres, incluir una letra mayúscula, una minúscula y un número.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(oldPassword, newPassword, token);
      setSuccess("Contraseña actualizada con éxito.");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);

      setTimeout(() => {
        setIsEditingPassword(false);
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Error al actualizar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleLogoutClick = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (err) {
      console.warn("Cerrando sesión localmente tras fallo de servidor:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      onLogout(); 
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#fdf9f4] text-[#1c1c19] min-h-screen flex flex-col overflow-x-hidden selection:bg-[#ffdad3]">
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
            Ayuda
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="flex flex-col md:flex-row overflow-hidden min-h-[calc(100vh-64px)]">
          
          {/* LADO IZQUIERDO: Tarjeta de Perfil Dinámica */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-[#ffffff] relative z-10">
            <div className="max-w-md w-full animate-fade-in-up bg-white/50 p-8 rounded-3xl shadow-xl shadow-[#9d3d2c]/5 border border-[#ddc0bb]/30 overflow-hidden">
              
              {isProfileLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border--[#9d3d2c] mx-auto mb-4"></div>
                  <p className="text-sm text-[#89726d]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Cargando perfil...</p>
                </div>
              ) : isProfilePending ? (
                /* 1. COMPLETAR PERFIL OBLIGATORIO */
                <div>
                  <div className="mb-6">
                    <h1 className="text-2xl text-[#9d3d2c] mb-1 font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>COMPLETAR PERFIL</h1>
                    <p className="text-xs text-[#89726d] font-bold uppercase tracking-wider">Teléfono y dirección son obligatorios</p>
                  </div>

                  {error && (
                    <div className="mb-4 p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-rose-600">error_outline</span>
                      {error}
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleProfileUpdate}>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Teléfono</label>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors text-lg">phone</span>
                          <input 
                            className="w-full pl-11 pr-4 py-2.5 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none text-sm" 
                            placeholder="Ej: 0998765432" type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} required style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Dirección de residencia</label>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors text-lg">home</span>
                          <input 
                            className="w-full pl-11 pr-4 py-2.5 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none text-sm" 
                            placeholder="Ej: Av. Amazonas N34-12" type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 flex flex-col gap-2">
                      <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] text-white rounded-full font-bold shadow-lg shadow-[#9d3d2c]/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm mt-2" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                        {isLoading ? "Guardando..." : "GUARDAR Y CONTINUAR"}
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </button>
                      <button type="button" onClick={handleLogoutClick} disabled={isLoading} className="w-full py-2.5 bg-white border border-[#ddd9d5] text-[#1c1c19] rounded-full font-bold hover:bg-[#f7f3ee] transition-all text-xs flex items-center justify-center gap-2" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                        CERRAR SESIÓN <span className="material-symbols-outlined text-sm">logout</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : isEditingPassword ? (
                /* 2. CAMBIAR CONTRASEÑA */
                <div>
                  <div className="mb-6">
                    <h1 className="text-2xl text-[#9d3d2c] mb-1 font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>CAMBIAR CONTRASEÑA</h1>
                  </div>
                  <form className="space-y-4" onSubmit={handlePasswordUpdate}>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#56423e] ml-1">Contraseña antigua</label>
                        <input className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] outline-none text-sm" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#56423e] ml-1">Nueva contraseña</label>
                        <input className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] outline-none text-sm" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#56423e] ml-1">Confirmar nueva contraseña</label>
                        <input className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] outline-none text-sm" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                      </div>
                    </div>
                    <div className="pt-2 flex flex-col gap-2">
                      <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#9d3d2c] text-white rounded-full font-bold text-sm">ACTUALIZAR</button>
                      <button type="button" onClick={() => setIsEditingPassword(false)} className="w-full py-3 bg-white border border-[#ddd9d5] text-[#1c1c19] rounded-full font-bold text-xs">CANCELAR</button>
                    </div>
                  </form>
                </div>
              ) : isEditingProfile ? (
                /* 3. EDITAR DATOS DEL PERFIL */
                <div>
                  <div className="mb-6">
                    <h1 className="text-2xl text-[#9d3d2c] mb-1 font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>EDITAR PERFIL</h1>
                  </div>
                  <form className="space-y-4" onSubmit={handleProfileUpdate}>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#56423e] ml-1">Nombre completo</label>
                        <input className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] outline-none text-sm" type="text" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#56423e] ml-1">Teléfono</label>
                        <input className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] outline-none text-sm" type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#56423e] ml-1">Dirección</label>
                        <input className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] outline-none text-sm" type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
                      </div>
                    </div>
                    <div className="pt-2 flex flex-col gap-2">
                      <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#9d3d2c] text-white rounded-full font-bold text-sm">GUARDAR CAMBIOS</button>
                      <button type="button" onClick={() => setIsEditingProfile(false)} className="w-full py-3 bg-white border border-[#ddd9d5] text-[#1c1c19] rounded-full font-bold text-xs">CANCELAR</button>
                    </div>
                  </form>
                </div>
              ) : (
                /* 4. MODO LECTURA ORIGINAL DEL PERFIL */
                <div className="text-center animate-fade-in-up">
                  <div className="relative mb-4 inline-block">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#9d3d2c]/10 shadow-md">
                      <img src={maxImage} alt="Foto de perfil" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute bottom-0 right-0 bg-[#9d3d2c] text-white w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow">
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                    </button>
                  </div>
                  <h1 className="text-2xl text-[#9d3d2c] mb-1 font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    {perfil?.nombre_completo || user?.user_metadata?.full_name || "Usuario"}
                  </h1>
                  
                  {/* BADGE DEL ROL SOLICITADO */}
                  <p className="text-xs font-black text-[#bd5541] bg-[#ffdad3]/50 px-3 py-1 rounded-full inline-block uppercase tracking-widest mb-6">
                    Cuenta: {user?.user_metadata?.rol || perfil?.rol || "adoptante"}
                  </p>

                  {success && (
                    <div className="mb-5 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                      {success}
                    </div>
                  )}

                  {/* Estadísticas rápidas originales */}
                  <div className="grid grid-cols-2 gap-4 mb-6" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                    <div className="bg-[#f7f3ee] p-3 rounded-2xl border border-[#ddc0bb]/20">
                      <span className="material-symbols-outlined text-[#9d3d2c] text-xl block mb-1">favorite</span>
                      <span className="text-xs font-bold text-[#89726d] block uppercase tracking-tight text-[10px]">Guardados</span>
                      <span className="text-base font-bold text-[#1c1c19]">0 mascotas</span>
                    </div>
                    <div className="bg-[#f7f3ee] p-3 rounded-2xl border border-[#ddc0bb]/20">
                      <span className="material-symbols-outlined text-[#c7aa16] text-xl block mb-1">potted_plant</span>
                      <span className="text-xs font-bold text-[#89726d] block uppercase tracking-tight text-[10px]">Procesos</span>
                      <span className="text-base font-bold text-[#1c1c19]">Ninguno activo</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 text-left bg-[#fdf9f4] p-5 rounded-2xl border border-[#ddc0bb]/40">
                    <div>
                      <span className="text-[9px] font-bold text-[#89726d] uppercase block">Correo Electrónico</span>
                      <span className="text-[#1c1c19] text-sm font-medium">{user?.email}</span>
                    </div>
                    <div className="h-px bg-[#ddc0bb]/30"></div>
                    <div>
                      <span className="text-[9px] font-bold text-[#89726d] uppercase block">Teléfono</span>
                      <span className="text-[#1c1c19] text-sm font-medium">{perfil?.telefono || "No registrado"}</span>
                    </div>
                    <div className="h-px bg-[#ddc0bb]/30"></div>
                    <div>
                      <span className="text-[9px] font-bold text-[#89726d] uppercase block">Dirección</span>
                      <span className="text-[#1c1c19] text-sm font-medium">{perfil?.direccion || "No registrado"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button onClick={() => { setIsEditingProfile(true); setError(""); setSuccess(""); }} className="w-1/2 py-2.5 bg-white border border-[#ddd9d5] text-[#1c1c19] rounded-full font-bold hover:bg-[#f7f3ee] transition-all text-xs">
                        EDITAR PERFIL
                      </button>
                      <button onClick={() => { setIsEditingPassword(true); setError(""); setSuccess(""); }} className="w-1/2 py-2.5 bg-white border border-[#ddd9d5] text-[#1c1c19] rounded-full font-bold hover:bg-[#f7f3ee] transition-all text-xs">
                        CLAVE
                      </button>
                    </div>
                    <button onClick={handleLogoutClick} disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] text-white rounded-full font-bold shadow-lg shadow-[#9d3d2c]/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs mt-2">
                      {isLoading ? "Cerrando sesión..." : "CERRAR SESIÓN"}
                      <span className="material-symbols-outlined text-sm">logout</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          
          <div className="w-full md:w-1/2 min-h-[400px] md:min-h-full relative overflow-hidden bg-[#9d3d2c] flex items-center justify-center">
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#bd5541]/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-5%] left-[20%] w-[300px] h-[300px] bg-[#c7aa16]/20 rounded-full blur-[80px]"></div>
            <div className="absolute inset-y-0 left-0 w-24 bg-white hidden md:block" style={{ clipPath: "polygon(0 0, 100% 0, 40% 10%, 100% 25%, 30% 45%, 100% 65%, 45% 85%, 100% 100%, 0 100%)" }}></div>

            <div className="relative h-full flex flex-col items-center justify-center text-center p-8 text-[#fffbff] z-20">
              <div className="mb-4 p-3 bg-white/10 rounded-full backdrop-blur-sm shadow-xl">
                <span className="material-symbols-outlined text-[36px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pets
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl mb-4 leading-tight font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                ¡Qué bueno verte!
              </h2>
              
              <p className="text-sm md:text-base max-w-sm mb-6 text-white/90 leading-relaxed" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                Gracias por formar parte de Huellas UIO. En tu perfil puedes gestionar tus datos de contacto para facilitar los procesos de adopción.
              </p>
              
              <div className="mt-8 pt-4 border-t border-white/10 w-full max-w-xs" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                <p className="text-[10px] font-bold text-white/70 mb-1">Campaña Permanente</p>
                <p className="text-xs font-bold text-[#c7aa16]">#AdoptaNoCompres</p>
              </div>
            </div>

            <img className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" alt="Mascota Max" src={maxImage} />
          </div>

        </section>
      </main>
    </div>
  );
}
