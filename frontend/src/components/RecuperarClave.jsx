// src/components/RecuperarClave.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const esLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.startsWith('192.168.') || 
                window.location.hostname.startsWith('10.') || 
                window.location.hostname === '::1';
                
const BaseURL = import.meta.env.VITE_BASE_URL_PRODUCCION || 
  (esLocal ? 'http://localhost:3000' : 'https://huellas-uio.vercel.app/_/backend');

const API_URL = `${BaseURL}/api/auth`;

export default function RecuperarClave() {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);

    useEffect(() => {
        // 1. Validar si la URL contiene un fragmento con hash (#)
        if (window.location.hash) {
            // Quitamos el '#' inicial y parseamos las variables
            const hashClean = window.location.hash.substring(1);
            const hashParams = new URLSearchParams(hashClean);
            
            // Supabase envía el token de recuperación en el parámetro 'access_token'
            const accessToken = hashParams.get('access_token');
            const type = hashParams.get('type');

            // Verificamos que sea un token válido de recuperación (type=recovery)
            if (accessToken && type === 'recovery') {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setToken(accessToken);
            }
        }
    }, []);

    const recuperar = async () => {
        const pass1 = document.getElementById("pass1").value;
        const pass2 = document.getElementById("pass2").value;

        if (!token) {
            alert("El token de recuperación ha expirado o es inválido.");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(pass1)) {
            alert("La contraseña debe tener al menos 6 caracteres, incluir una letra mayúscula, una minúscula y un número.");
            return;
        }

        if (pass1 !== pass2) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        try {
    const response = await fetch(`${API_URL}/recuperarClave/confirm`, {
        method: "PUT", // <-- Cambiado de POST a PUT
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ token: token, password: pass1 }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al actualizar contraseña.");
    }

    alert("Contraseña restablecida con éxito.");
    navigate("/"); 
} catch (error) {
    alert(error.message || "Hubo un error en el servidor.");
    console.error("Error en recuperar service:", error);
}

    };

    if (token) {
        return (
            <div className="bg-[#fdf9f4] text-[#1c1c19] min-h-screen flex flex-col overflow-x-hidden selection:bg-[#ffdad3]">
                <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&family=Nunito+Sans:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet"/>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

                <main className="flex-1 flex items-center justify-center p-6">
                    <section className="w-full max-w-xl">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-[#9d3d2c]/10 border border-[#ddc0bb]/30 overflow-hidden">
                            <div className="p-6 md:p-8 bg-[#fdf9f4] border-b border-[#ddc0bb]/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-[#9d3d2c]/10 border border-[#ddc0bb]/30 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#9d3d2c] text-3xl">lock_reset</span>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-[#9d3d2c]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                                            Recuperar Clave
                                        </h1>
                                        <p className="text-xs md:text-sm text-[#89726d] font-semibold" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                                            Ingresa tu nueva contraseña a continuación.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                                            Nueva contraseña
                                        </label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors text-lg">key</span>
                                            <input 
                                                type="password"
                                                placeholder="Mínimo 6 caracteres"
                                                id="pass1"
                                                className="w-full pl-11 pr-4 py-2.5 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none text-sm"
                                                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#56423e] ml-1" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                                            Confirmar nueva contraseña
                                        </label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] transition-colors text-lg">check_circle</span>
                                            <input 
                                                type="password"
                                                placeholder="Repite tu contraseña"
                                                id="pass2"
                                                className="w-full pl-11 pr-4 py-2.5 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] placeholder:text-[#89726d]/50 outline-none text-sm"
                                                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={recuperar}
                                        className="w-full py-3 bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] text-white rounded-full font-bold shadow-lg shadow-[#9d3d2c]/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                                        style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                                    >
                                        <span className="material-symbols-outlined text-lg">verified</span>
                                        Confirmar recuperación de contraseña
                                    </button>

                                    <div className="text-center pt-2">
                                        <p className="text-[11px] font-bold text-[#89726d]">
                                            Recomendación: usa una clave segura que combine letras y números.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-[#fdf9f4] text-[#1c1c19] min-h-screen flex flex-col overflow-x-hidden selection:bg-[#ffdad3]">
            <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&family=Nunito+Sans:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet"/>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

            <main className="flex-1 flex items-center justify-center p-6">
                <section className="w-full max-w-xl">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-[#9d3d2c]/10 border border-[#ddc0bb]/30 overflow-hidden">
                        <div className="p-6 md:p-8 bg-[#fdf9f4] border-b border-[#ddc0bb]/30">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-rose-600 text-3xl">error_outline</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#9d3d2c]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                                        Enlace de recuperación inválido
                                    </h1>
                                    <p className="text-xs md:text-sm text-[#89726d] font-semibold" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                                        No se encontró un token válido. Por favor, solicita un nuevo correo de recuperación.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="p-4 md:p-5 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs font-bold flex items-start gap-3">
                                <span className="material-symbols-outlined text-lg text-rose-600 mt-0.5">info</span>
                                <p>
                                    Si ya solicitaste el correo hace poco, espera unos minutos e intenta nuevamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
