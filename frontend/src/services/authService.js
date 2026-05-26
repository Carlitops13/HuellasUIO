const API_URL = "http://localhost:3000/api/auth";
const PERFILES_API_URL = "http://localhost:3000/api/perfiles";

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

/**
 * Registra un nuevo usuario enviando datos al backend de Express.
 */
export async function registerUser(email, password, nombreCompleto) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        nombre_completo: nombreCompleto,
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
    const response = await fetch(`${PERFILES_API_URL}/mi-perfil`, {
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
    const response = await fetch(`${PERFILES_API_URL}/mi-perfil`, {
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
export async function updatePassword(password, token) {
  try {
    const response = await fetch(`${API_URL}/update-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
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
