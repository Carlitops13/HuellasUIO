const BaseURL=import.meta.env.VITE_BASE_URL_PRODUCCION || 'https://huellas-uio.vercel.app/_/backend'; // Cambia esto según tu configuración de desarrollo/producción
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
