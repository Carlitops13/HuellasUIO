import { useState, useEffect } from "react";

// Importar imágenes de historias desde assets
import maxImage from "../assets/max.webp";
import MMNImage from "../assets/MMN.png";
import mangoImage from "../assets/Mango.png";
import mielImage from "../assets/miel.png"; 
import nenaImage from "../assets/nena.png";

// Arreglo estático de historias de éxito
const listadoHistorias = [
  {
    id: 1,
    titulo: "Max: Presidente vitalicio de los Poliperros",
    imagen: maxImage,
    fundacion: "EPN",
    colorBadge: "bg-blue-600",
    texto: "Mascota símbolo emblemático de la Escuela Politécnica Nacional. Su legado siempre será recordado.",
    fecha: "♾️"
  },
  {
    id: 2,
    titulo: "Mora, Nina y Nube",
    imagen: MMNImage,
    fundacion: "Fundación Lucky",
    colorBadge: "bg-[#1a0e4b]",
    texto: "Cada una con una historia diferente de vida pero con el mismo final feliz, tener una familia",
    fecha: "Adoptadas hace 5 años"
  },
  {
    id: 3,
    titulo: "Mango",
    imagen: mangoImage,
    fundacion: "UBA Quito",
    colorBadge: "bg-emerald-600",
    texto: "Mango, rescatado desde la Mitad del Mundo, su origen es incierto ya que caminaba con tan solo 2 meses de edad por los parajes desiertos del sector. Carlos se convirtió en su dueño ahora vive feliz en un hogar lleno de amor junto a su familia.",
    fecha: "Adoptado hace 6 años"
  },
  {
    id: 4,
    titulo: "Nena",
    imagen: nenaImage,
    fundacion: "Fundación PAE",
    colorBadge: "bg-[#c7aa16]",
    texto: "Nena fue rescatada de una familia que la tenía como animal de cría por su raza, sus gatitos eran vendidos. Encontró a su familia en el sector de Conocoto, donde vive feliz junto a sus humanos favoritos. ",
    fecha: "Adoptada hace 15 años"
  },
  {
    id: 5,
    titulo: "Miel",
    imagen: mielImage,
    fundacion: "Adoptante independiente",
    colorBadge: "bg-[#493c28]",
    texto: "Miel fue adoptada luego de que alguien la escuchó llorar fuera de su casa, fue encontrada dentro de una alcantarilla, sin su mamá y con tan solo semanas de vida. Ahora vive feliz en un hogar lleno de amor junto a su familia.",
    fecha: "Adoptada hace 2 meses"
  }
];

export default function Header({ 
  token, 
  onLogout, 
  onIrAPerfil, 
  onVolver, 
  vistaActual 
}) {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  

  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  // Leer datos de usuario cuando cambia el token
  useEffect(() => {
    if (token) {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error parseando usuario de sessionStorage", e);
        }
      }
    } else {
      setUser(null);
    }
  }, [token]);

  // Cerrar dropdowns si se hace click afuera
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".user-menu-container")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    if (onLogout) onLogout();
  };

  const handleLinkClick = (targetId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Si no está en la página actual (ej. estamos en perfil y queremos ir al catálogo)
      if (onVolver) onVolver();
      // Esperar a que renderice y hacer scroll
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  };

  const handlePrevStory = () => {
    const currentIndex = listadoHistorias.findIndex(s => s.id === selectedStory.id);
    const prevIndex = (currentIndex - 1 + listadoHistorias.length) % listadoHistorias.length;
    setSelectedStory(listadoHistorias[prevIndex]);
  };

  const handleNextStory = () => {
    const currentIndex = listadoHistorias.findIndex(s => s.id === selectedStory.id);
    const nextIndex = (currentIndex + 1) % listadoHistorias.length;
    setSelectedStory(listadoHistorias[nextIndex]);
  };

  const getInitials = () => {
    if (!user) return "U";
    const name = user.user_metadata?.nombre || user.user_metadata?.full_name || user.email || "Usuario";
    return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  };

  const getUserName = () => {
    if (!user) return "Usuario";
    return user.user_metadata?.nombre || user.user_metadata?.full_name || user.email.split("@")[0];
  };

  const getUserRole = () => {
    if (!user) return "adoptante";
    return user.user_metadata?.rol || user.rol || "adoptante";
  };

  return (
    <>
      <header className="bg-[#fdf9f4]/95 backdrop-blur-md shadow-sm shadow-[#9d3d2c]/5 top-0 z-50 sticky border-b border-[#ddc0bb]/20">
        <div className="flex justify-between items-center w-full px-5 md:px-16 max-w-[1280px] mx-auto h-16">
          
          {/* Logo */}
          <div 
            onClick={() => {
              if (onVolver) onVolver();
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-2xl md:text-3xl text-[#9d3d2c] tracking-tight font-extrabold cursor-pointer flex items-center gap-2 select-none"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            <span className="material-symbols-outlined text-[#9d3d2c] text-3xl">pets</span>
            <span>Huellas UIO</span>
          </div>

          {/* Menú Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => handleLinkClick("catalogo-publico")}
              className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm bg-transparent border-0 cursor-pointer"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              Encuentra una mascota
            </button>
            <button 
              onClick={() => setShowHowItWorks(true)}
              className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm bg-transparent border-0 cursor-pointer"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              Cómo funciona
            </button>
            <button 
              onClick={() => handleLinkClick("apoyado-por")}
              className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm bg-transparent border-0 cursor-pointer"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              Refugios Aliados
            </button>
            <button 
              onClick={() => setShowStories(true)}
              className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm bg-transparent border-0 cursor-pointer"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              Historias
            </button>
          </nav>

          {/* Auth Button / Dropdown */}
          <div className="flex items-center gap-4">
            {token ? (
              /* Usuario Autenticado: Dropdown */
              <div className="relative user-menu-container">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-[#ddc0bb]/40 bg-white hover:bg-[#f7f3ee] hover:border-[#9d3d2c]/30 transition-all cursor-pointer shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-[#9d3d2c] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                    {getInitials()}
                  </div>
                  <span className="hidden sm:inline font-bold text-xs text-[#56423e] max-w-[100px] truncate" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                    {getUserName()}
                  </span>
                  <span className="material-symbols-outlined text-sm text-[#89726d] pointer-events-none">
                    {dropdownOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#ddc0bb]/30 shadow-xl py-2 z-50 animate-fade-in-up"
                    style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    <div className="px-4 py-2 border-b border-[#f7f3ee]">
                      <p className="text-[10px] font-bold text-[#89726d] uppercase tracking-wider">Rol de Cuenta</p>
                      <p className="text-xs font-extrabold text-[#9d3d2c] capitalize">{getUserRole()}</p>
                    </div>
                    
                    {vistaActual !== "perfil" && onIrAPerfil && (
                      <button 
                        onClick={() => { setDropdownOpen(false); onIrAPerfil(); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#56423e] hover:bg-[#ffdad3]/20 hover:text-[#9d3d2c] transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">account_circle</span>
                        Ver mi Perfil
                      </button>
                    )}

                    {vistaActual === "perfil" && onVolver && (
                      <button 
                        onClick={() => { setDropdownOpen(false); onVolver(); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#56423e] hover:bg-[#ffdad3]/20 hover:text-[#9d3d2c] transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">dashboard</span>
                        Ir a mi Panel
                      </button>
                    )}

                    <button 
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2 border-t border-[#f7f3ee] mt-1"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Usuario No Autenticado: Botón Iniciar Sesión */
              <button 
                onClick={() => {
                  const loginSection = document.getElementById("login-section");
                  if (loginSection) {
                    loginSection.scrollIntoView({ behavior: "smooth", block: "center" });
                  } else {
                    if (onVolver) onVolver();
                  }
                }}
                className="bg-[#9d3d2c] text-white px-6 py-2 rounded-full font-bold text-xs hover:bg-[#802919] hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#9d3d2c]/20" 
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Ingresar / Registrarse
              </button>
            )}

            {/* Hamburguesa Móvil */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#56423e] hover:text-[#9d3d2c] bg-white border border-[#ddc0bb]/40 rounded-xl flex items-center shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Menú Lateral Móvil (Drawer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#1c1c19]/30 backdrop-blur-sm transition-opacity"
          ></div>

          {/* Drawer Body */}
          <div 
            className="relative w-72 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-fade-in-right"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#f7f3ee] pb-4 mb-6">
                <span className="text-xl text-[#9d3d2c] font-extrabold" style={{ fontFamily: "'Quicksand', sans-serif" }}>Navegación</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg border border-[#ddc0bb]/30 text-[#89726d]"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <nav className="flex flex-col gap-4">
                <button 
                  onClick={() => handleLinkClick("catalogo-publico")}
                  className="w-full text-left py-2 px-3 rounded-xl font-bold text-sm text-[#56423e] hover:bg-[#ffdad3]/20 hover:text-[#9d3d2c] transition-all"
                >
                  Encuentra una mascota
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setShowHowItWorks(true); }}
                  className="w-full text-left py-2 px-3 rounded-xl font-bold text-sm text-[#56423e] hover:bg-[#ffdad3]/20 hover:text-[#9d3d2c] transition-all"
                >
                  Cómo funciona
                </button>
                <button 
                  onClick={() => handleLinkClick("apoyado-por")}
                  className="w-full text-left py-2 px-3 rounded-xl font-bold text-sm text-[#56423e] hover:bg-[#ffdad3]/20 hover:text-[#9d3d2c] transition-all"
                >
                  Nuestros refugios
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setShowStories(true); }}
                  className="w-full text-left py-2 px-3 rounded-xl font-bold text-sm text-[#56423e] hover:bg-[#ffdad3]/20 hover:text-[#9d3d2c] transition-all"
                >
                  Historias
                </button>
              </nav>
            </div>

            {token && (
              <div className="border-t border-[#f7f3ee] pt-4">
                <button 
                  onClick={handleLogoutClick}
                  className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: CÓMO FUNCIONA ================= */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-[#1c1c19]/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div 
            className="bg-[#fdf9f4] w-full max-w-xl rounded-3xl overflow-hidden border border-[#ddc0bb]/40 shadow-2xl animate-fade-in-up"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            <div className="p-6 md:p-8 relative">
              <button 
                onClick={() => setShowHowItWorks(false)}
                className="absolute top-4 right-4 text-[#89726d] hover:text-[#9d3d2c] p-1.5 rounded-full bg-white border border-[#ddc0bb]/30 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl text-[#9d3d2c] font-black" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  ¿Cómo funciona la adopción?
                </h3>
                <p className="text-xs text-[#89726d] font-bold">PROCESO DE ADOPCIÓN EN HUELLAS UIO</p>
              </div>

              {/* Pasos */}
              <div className="space-y-4 relative before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#ddc0bb]/30">
                {/* Paso 1 */}
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-[#9d3d2c] text-[#9d3d2c] flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm">
                    1
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#ddc0bb]/20 shadow-sm flex-1">
                    <h4 className="font-extrabold text-sm text-[#1c1c19] mb-0.5">Explora el Catálogo</h4>
                    <p className="text-xs text-[#56423e] leading-relaxed">
                      Revisa los perfiles de perros y gatos rescatados por las fundaciones afiliadas. Filtra por especie, ubicación y edad.
                    </p>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-[#9d3d2c] text-[#9d3d2c] flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm">
                    2
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#ddc0bb]/20 shadow-sm flex-1">
                    <h4 className="font-extrabold text-sm text-[#1c1c19] mb-0.5">Completa tu Perfil e Inicia Solicitud</h4>
                    <p className="text-xs text-[#56423e] leading-relaxed">
                      Regístrate e ingresa tus datos residenciales. Envía una postulación motivada para la mascota elegida con un solo clic.
                    </p>
                  </div>
                </div>

                {/* Paso 3 */}
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-[#9d3d2c] text-[#9d3d2c] flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm">
                    3
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#ddc0bb]/20 shadow-sm flex-1">
                    <h4 className="font-extrabold text-sm text-[#1c1c19] mb-0.5">Revisión y Aprobación</h4>
                    <p className="text-xs text-[#56423e] leading-relaxed">
                      La fundación a cargo analizará tu solicitud, tu tipo de vivienda y tus respuestas. Si todo es óptimo, aprobarán tu postulación.
                    </p>
                  </div>
                </div>

                {/* Paso 4 */}
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-[#c7aa16] text-[#c7aa16] flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm">
                    🐶/🐱
                  </div>
                  <div className="bg-[#c7aa16]/5 p-4 rounded-2xl border border-[#c7aa16]/20 shadow-sm flex-1">
                    <h4 className="font-extrabold text-sm text-[#c7aa16] mb-0.5">¡Bienvenido a la familia!</h4>
                    <p className="text-xs text-[#56423e] leading-relaxed">
                      Coordina la entrega o recogida con el rescatista y dale la bienvenida a tu nuevo compañero de vida.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowHowItWorks(false)}
                  className="bg-[#9d3d2c] text-white px-8 py-2.5 rounded-full font-bold text-xs hover:bg-[#802919] transition-all cursor-pointer shadow-md"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: HISTORIAS DE ÉXITO ================= */}
      {showStories && (
        <div className="fixed inset-0 bg-[#1c1c19]/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div 
            className="bg-[#fdf9f4] w-full max-w-2xl rounded-3xl overflow-hidden border border-[#ddc0bb]/40 shadow-2xl animate-fade-in-up"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            <div className="p-6 md:p-8 relative">
              <button 
                onClick={() => { setShowStories(false); setSelectedStory(null); }}
                className="absolute top-4 right-4 text-[#89726d] hover:text-[#9d3d2c] p-1.5 rounded-full bg-white border border-[#ddc0bb]/30 cursor-pointer transition-all z-20"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              {selectedStory ? (
                /* VISTA DETALLE DE LA HISTORIA */
                <div className="space-y-6 animate-fade-in-up">
                  <div className="h-64 md:h-80 overflow-hidden rounded-2xl relative bg-[#f7f3ee] border border-[#ddc0bb]/20 flex items-center justify-center">
                    <img 
                      src={selectedStory.imagen} 
                      alt={selectedStory.titulo} 
                      className="w-full h-full object-contain" 
                    />
                    <span className={`absolute bottom-3 left-3 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full ${selectedStory.colorBadge}`}>
                      {selectedStory.fundacion}
                    </span>

                    {/* Botón Izquierdo (Anterior) */}
                    <button 
                      onClick={handlePrevStory}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#9d3d2c] hover:scale-105 active:scale-95 w-9 h-9 rounded-full flex items-center justify-center border border-[#ddc0bb]/30 cursor-pointer shadow shadow-[#9d3d2c]/10 transition-all z-10"
                      title="Historia anterior"
                    >
                      <span className="material-symbols-outlined font-bold text-lg select-none">chevron_left</span>
                    </button>

                    {/* Botón Derecho (Siguiente) */}
                    <button 
                      onClick={handleNextStory}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#9d3d2c] hover:scale-105 active:scale-95 w-9 h-9 rounded-full flex items-center justify-center border border-[#ddc0bb]/30 cursor-pointer shadow shadow-[#9d3d2c]/10 transition-all z-10"
                      title="Siguiente historia"
                    >
                      <span className="material-symbols-outlined font-bold text-lg select-none">chevron_right</span>
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="text-xl md:text-2xl text-[#9d3d2c] font-black mb-2" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                      {selectedStory.titulo}
                    </h4>
                    <p className="text-sm text-[#56423e] leading-relaxed italic p-4 bg-white rounded-2xl border border-[#ddc0bb]/10 whitespace-pre-line">
                      "{selectedStory.texto}"
                    </p>
                    <p className="text-[10px] text-[#89726d] font-bold mt-3">— {selectedStory.fecha}</p>
                  </div>

                  <div className="pt-2 text-center">
                    <button 
                      onClick={() => setSelectedStory(null)}
                      className="bg-[#9d3d2c]/10 text-[#9d3d2c] hover:bg-[#9d3d2c]/20 px-6 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 mx-auto cursor-pointer border-0"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      Volver a las historias
                    </button>
                  </div>
                </div>
              ) : (
                /* VISTA LISTADO DE HISTORIAS */
                <>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#c7aa16] flex items-center justify-center mx-auto mb-3">
                      
                    </div>
                    <h3 className="text-2xl text-[#9d3d2c] font-black" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                      Historias con Final Feliz
                    </h3>
                    <p className="text-xs text-[#89726d] font-bold">DE NUESTRA COMUNIDAD</p>
                  </div>

                  {/* Grid de Historias */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
                    {listadoHistorias.map((story) => (
                      <div 
                        key={story.id} 
                        onClick={() => setSelectedStory(story)}
                        className="bg-white rounded-2xl overflow-hidden border border-[#ddc0bb]/20 shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group"
                      >
                        <div className="h-40 overflow-hidden relative bg-[#f7f3ee]">
                          <img 
                            src={story.imagen} 
                            alt={story.titulo} 
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                          />
                          <span className={`absolute bottom-2 left-2 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${story.colorBadge}`}>
                            {story.fundacion}
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-extrabold text-sm text-[#1c1c19] mb-1 group-hover:text-[#9d3d2c] transition-colors">{story.titulo}</h4>
                            <p className="text-xs text-[#56423e] leading-relaxed italic line-clamp-2">
                              "{story.texto}"
                            </p>
                          </div>
                          <p className="text-[10px] text-[#89726d] font-bold mt-2">— {story.fecha}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => { setShowStories(false); setSelectedStory(null); }}
                      className="bg-[#9d3d2c] text-white px-8 py-2.5 rounded-full font-bold text-xs hover:bg-[#802919] transition-all cursor-pointer shadow-md border-0"
                    >
                      Regresar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
