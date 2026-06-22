const esLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.startsWith('192.168.') || 
                window.location.hostname.startsWith('10.') || 
                window.location.hostname === '::1';

const BaseURL = import.meta.env.VITE_BASE_URL_PRODUCCION || 
  (esLocal ? 'http://localhost:3000' : 'https://huellas-uio.vercel.app/_/backend');
const API_URL = `${BaseURL}/api/auth`;
const PERFILES_API_URL = `${BaseURL}/api/users`;/**
 * Inicia sesión del usuario enviando credenciales al backend de Express.
 */
export async function confirmRecoverPassword(accessToken, password) {
  try {
    const response = await fetch(`${API_URL}/recuperarClave/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: accessToken, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al confirmar recuperación de contraseña.");
    }

    return data;
  } catch (error) {
    console.error("Error en confirmRecoverPassword service:", error);
    throw error;
  }
}

/**
 * Inicia sesión del usuario enviando credenciales al backend de Express.
 */
export async function recoverPassword(email) {
  try {
    const response = await fetch(`${API_URL}/recuperarClave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al recuperar contraseña.");
    }

    return data;
  } catch (error) {
    console.error("Error en recoverPassword service:", error);
    throw error;
  }
}

/**
 * Inicia sesión del usuario enviando credenciales al backend de Express.
 */
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al iniciar sesión.");
    }

    return data;
  } catch (error) {
    console.error("Error en loginUser service:", error);
    throw error;
  }
}

export async function registerUser(email, password, nombreCompleto, rol) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
        nombre_completo: nombreCompleto,
        rol: rol, // <-- Aquí nos aseguramos de que viaje el rol seleccionado ('adoptante' o 'rescatista')
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al registrarse.");
    }

    return data;
  } catch (error) {
    console.error("Error en registerUser service:", error);
    throw error;
  }
}

/**
 * Cierra la sesión en el backend enviando el token Bearer JWT.
 */
export async function logoutUser(token) {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al cerrar sesión.");
    }

    return data;
  } catch (error) {
    console.error("Error en logoutUser service:", error);
    throw error;
  }
}

/**
 * Obtiene el perfil de la base de datos para el usuario autenticado.
 */
export async function getProfile(token) {
  try {
    const response = await fetch(`${PERFILES_API_URL}/adoptante/viewProfile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al obtener perfil.");
    }

    return data;
  } catch (error) {
    console.error("Error en getProfile service:", error);
    throw error;
  }
}

/**
 * Actualiza la información del perfil del usuario (teléfono, dirección, etc.).
 */
export async function updateProfile(profileData, token) {
  try {
    const response = await fetch(`${PERFILES_API_URL}/adoptante/updateProfile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar perfil.");
    }

    return data;
  } catch (error) {
    console.error("Error en updateProfile service:", error);
    throw error;
  }
}

/**
 * Actualiza la contraseña en Supabase Auth.
 */
export async function updatePassword(oldPassword, password, token) {
  try {
    const response = await fetch(`${API_URL}/update-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar contraseña.");
    }

    return data;
  } catch (error) {
    console.error("Error en updatePassword service:", error);
    throw error;
  }
}

/**
 * Obtener solicitudes de adopción recibidas (Rescatistas).
 */
export async function getSolicitudesRecibidas(token) {
  try {
    const response = await fetch(`${PERFILES_API_URL}/rescatista/solicitudesRecibidas`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al obtener solicitudes recibidas.");
    }
    return data;
  } catch (error) {
    console.error("Error en getSolicitudesRecibidas:", error);
    throw error;
  }
}

/**
 * Responder a una solicitud de adopción (Rescatistas).
 */
export async function responderSolicitudAdopcion(idSolicitud, estado, comentarios, token) {
  try {
    const response = await fetch(`${PERFILES_API_URL}/rescatista/responderSolicitud/${idSolicitud}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        estado_solicitud: estado,
        comentarios_admin: comentarios,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar la solicitud.");
    }
    return data;
  } catch (error) {
    console.error("Error en responderSolicitudAdopcion:", error);
    throw error;
  }
}

/**
 * Postular a una adopción (Adoptante).
 */
export async function postularAdopcion(mascotaId, motivo, tieneOtrasMascotas, tipoVivienda, token) {
  try {
    const response = await fetch(`${PERFILES_API_URL}/adoptante/adoptionRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        mascota_id: mascotaId,
        motivo_adopcion: motivo,
        tiene_otras_mascotas: tieneOtrasMascotas === "Sí" || tieneOtrasMascotas === true,
        tipo_vivienda: tipoVivienda,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al enviar la solicitud.");
    }
    return data;
  } catch (error) {
    console.error("Error en postularAdopcion:", error);
    throw error;
  }
}

/**
 * Obtener estado de solicitudes enviadas (Adoptante).
 */
export async function getMisSolicitudes(token) {
  try {
    const response = await fetch(`${PERFILES_API_URL}/adoptante/viewAdoptionStatus`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al consultar tus solicitudes.");
    }
    return data;
  } catch (error) {
    console.error("Error en getMisSolicitudes:", error);
    throw error;
  }
}
