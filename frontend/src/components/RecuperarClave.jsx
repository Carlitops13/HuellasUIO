// src/components/RecuperarClave.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:3000/api/auth";

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
            <div>
                <h1>Recuperar Clave</h1>
                <p>Ingresa tu nueva contraseña a continuación.</p>
                <input type="password" placeholder="Nueva contraseña" id="pass1" />
                <input type="password" placeholder="Confirmar nueva contraseña" id="pass2" />
                <button onClick={recuperar}>Confirmar recuperación de contraseña</button>
            </div>
        );
    }

    return (
        <div>
            <h1>Enlace de recuperación inválido</h1>
            <p>No se encontró un token válido. Por favor, solicita un nuevo correo de recuperación.</p>
        </div>
    );
}
