import { useState, useEffect } from "react";

export default function LoginForms() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function login(user, password) {
    if (user === "admin" && password === "123") {
      alert("Ingreso Exitoso!");
    } else {
      alert("Usuario o contraseña inválidos.");
    }
    setPassword("");
    setUsername("");
  }


  useEffect(() => {
    const elements = document.querySelectorAll('.animate-fade-in-up');
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      setTimeout(() => {
        el.style.transition = 'all 0.6s ease-out';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 100 * index);
    });
  }, []);

  return (
    <div className="bg-[#fdf9f4] text-[#1c1c19] min-h-screen flex flex-col overflow-x-hidden selection:bg-[#ffdad3]">
      
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&family=Nunito+Sans:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

      
      <header className="bg-[#fdf9f4]/90 backdrop-blur-md shadow-sm shadow-[#9d3d2c]/5 top-0 z-50 sticky">
        <div className="flex justify-between items-center w-full px-5 md:px-16 max-w-[1280px] mx-auto h-20">
          <div className="text-3xl md:text-5xl text-[#9d3d2c] tracking-tight font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>
            Huellas UIO
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }} href="#">Encuentra una mascota</a>
            <a className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }} href="#">Como funciona</a>
            <a className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }} href="#">Nuestros refugios</a>
            <a className="text-[#56423e] hover:text-[#9d3d2c] transition-colors font-bold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }} href="#">Historias</a>
          </nav>
          <button className="bg-[#9d3d2c] text-white px-6 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            Help
          </button>
        </div>
      </header>

      <main className="flex-1">
       
        <section className="flex flex-col md:flex-row overflow-hidden min-h-screen">
          
          
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#ffffff] relative z-10">
            <div className="max-w-md w-full animate-fade-in-up bg-white/50 p-10 rounded-3xl shadow-xl shadow-[#9d3d2c]/5 border border-[#ddc0bb]/30">
              <div className="mb-12">
                <h1 className="text-3xl text-[#9d3d2c] mb-4 tracking-tight font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>INICIAR SESIÓN</h1>
              </div>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); login(username, password); }}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Correo electrónico</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors">mail</span>
                      <input 
                        className="w-full pl-12 pr-4 py-3.5 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none" 
                        placeholder="nombre@ejemplo.com" 
                        type="text"
                        id="usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Contraseña</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors">lock</span>
                      <input 
                        className="w-full pl-12 pr-4 py-3.5 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none" 
                        placeholder="Contraseña" 
                        type="password"
                        id="clave"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm font-bold py-2" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-5 h-5 rounded-md border-[#89726d] text-[#9d3d2c] focus:ring-[#9d3d2c] focus:ring-offset-0 transition-all" type="checkbox" />
                    <span className="text-[#56423e] group-hover:text-[#9d3d2c] transition-colors">Recordarme</span>
                  </label>
                  <a className="text-[#9d3d2c] hover:text-[#802919] transition-all" href="#">¿Olvidaste tu contraseña?</a>
                </div>

                <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] text-white rounded-full font-bold shadow-lg shadow-[#9d3d2c]/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                  INICIAR SESION
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </form>

              <div className="mt-12 text-center" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                <div className="flex items-center gap-4 my-8">
                  <div className="h-px flex-1 bg-[#ddc0bb]"></div>
                  <p className="text-xs font-bold text-[#89726d] uppercase tracking-widest">Iniciar sesion con</p>
                  <div className="h-px flex-1 bg-[#ddc0bb]"></div>
                </div>
                <div className="flex flex-col gap-3 mt-6">
                  <button className="w-full py-3.5 bg-white border border-[#ddd9d5] rounded-full flex items-center justify-center gap-3 hover:bg-[#f7f3ee] transition-all group">
                    <span className="material-symbols-outlined text-[#1c1c19] text-xl">account_circle</span>
                    <span className="font-sans font-bold text-sm text-[#1c1c19]">Continuar con Google</span></button>
                    <button className="w-full py-3.5 bg-white border border-[#ddd9d5] rounded-full flex items-center justify-center gap-3 hover:bg-[#f7f3ee] transition-all group">
                      <span className="material-symbols-outlined text-[#1c1c19] text-xl">public</span><span className="font-sans font-bold text-sm text-[#1c1c19]">Continuar con Facebook</span></button></div>
                      </div>
                      </div>
                      </div>
          <div className="w-full md:w-1/2 min-h-[400px] md:min-h-full relative overflow-hidden bg-[#9d3d2c]">
            
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#bd5541]/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-5%] left-[20%] w-[300px] h-[300px] bg-[#c7aa16]/20 rounded-full blur-[80px]"></div>
            
            
            <div className="absolute inset-y-0 left-0 w-24 bg-white hidden md:block" style={{ clipPath: "polygon(0 0, 100% 0, 40% 10%, 100% 25%, 30% 45%, 100% 65%, 45% 85%, 100% 100%, 0 100%)" }}></div>
            
            <div className="relative h-full flex flex-col items-center justify-center text-center p-12 text-[#fffbff] z-20">
              <div className="mb-8 p-4 bg-white/10 rounded-full backdrop-blur-sm shadow-xl">
                <span className="material-symbols-outlined text-[48px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
              </div>
              <h2 className="text-4xl md:text-5xl mb-6 leading-tight font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>¡Encantado de conocerte!</h2>
              <p className="text-lg max-w-sm mb-12 text-white/90" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                Únete a nuestra comunidad de corazones compasivos. Cada mascota merece un hogar cálido y una familia que ame.
              </p>
              <button className="px-10 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full font-bold text-sm border-2 border-white/50 hover:scale-[1.05] active:scale-95 transition-all" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                REGISTRARSE
              </button>
              
              <div className="mt-16 pt-8 border-t border-white/10 w-full max-w-xs" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                <p className="text-xs font-bold text-white/70 mb-4">Registrarse</p>
                <div className="flex justify-center gap-4">
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/20">
                    <span className="material-symbols-outlined text-sm">social_leaderboard</span>
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/20">
                    <span className="material-symbols-outlined text-sm">publico</span>
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/20">
                    <span className="material-symbols-outlined text-sm">alternate_email</span>
                  </button>
                </div>
              </div>
            </div>
            
            
            <img 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" 
              alt="Joyful retriever family scene" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHR4pzoQxtNdlXZlnd0yUL0OKmsqlLa_0GHiJ7Z_S5pUoWRdfe8ApC938HPvjC1dTQcsZTQgiLXKs2wu9TVeMDP75mALAcfJIeuGart5GHAI7Uvrw1ddABvsY08gVuPn5qrxbly6YiKlFc2K18ZViG_bYu4hXoZenRoI1op7CX5VGgDi-T6IA_1Ddk_Bao5ejC7BGBYjmRcediCwwN7wb2agrwyp0nPoFgxCOkIFzY6gCxoVfC_YKsok-xlskQIHfk27QU0C0HWoU"
            />
          </div>
        </section>
      </main>

      
      <svg className="absolute pointer-events-none h-0 w-0">
        <defs>
          <clipPath clipPathUnits="objectBoundingBox" id="wave-clip">
            <path d="M0.1,0 C0.05,0.1 0.15,0.2 0.05,0.35 C-0.05,0.5 0.1,0.65 0.05,0.8 C0,0.9 0.1,1 0.1,1 H1 V0 H0.1 Z"></path>
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}