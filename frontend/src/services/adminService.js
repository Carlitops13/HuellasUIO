const esLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.startsWith('192.168.') || 
                window.location.hostname.startsWith('10.') || 
                window.location.hostname === '::1';

const BaseURL = import.meta.env.VITE_BASE_URL_PRODUCCION || 
  (esLocal ? 'http://localhost:3000' : 'https://huellas-uio.vercel.app/_/backend');

const API_URL = `${BaseURL}/api/admin`;

/**
 * Obtener todos los usuarios del sistema (Perfiles).
 */
export async function getAllUsers(token) {
  try {
    const response = await fetch(`${API_URL}/viewUsers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener la lista de usuarios.');
    }
    return data;
  } catch (error) {
    console.error('Error en getAllUsers service:', error);
    throw error;
  }
}

/**
 * Crear un nuevo usuario desde el panel administrativo.
 */
export async function createUserAdmin(userData, token) {
  try {
    const response = await fetch(`${API_URL}/createUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear el usuario.');
    }
    return data;
  } catch (error) {
    console.error('Error en createUserAdmin service:', error);
    throw error;
  }
}

/**
 * Actualizar datos de un usuario por su ID.
 */
export async function updateUserAdmin(id, userData, token) {
  try {
    const response = await fetch(`${API_URL}/updateUser/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar el usuario.');
    }
    return data;
  } catch (error) {
    console.error('Error en updateUserAdmin service:', error);
    throw error;
  }
}

/**
 * Eliminar permanentemente un usuario.
 */
export async function deleteUserAdmin(id, token) {
  try {
    const response = await fetch(`${API_URL}/deleteUser/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar el usuario.');
    }
    return data;
  } catch (error) {
    console.error('Error en deleteUserAdmin service:', error);
    throw error;
  }
}

/**
 * Suspender o reactivar una cuenta de usuario.
 * @param {string} id ID del usuario.
 * @param {string} action 'suspend' o 'reactivate'.
 * @param {string} token Token del administrador.
 */
export async function toggleSuspendUserAdmin(id, action, token) {
  try {
    const response = await fetch(`${API_URL}/suspendAccount/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al modificar estado de suspensión.');
    }
    return data;
  } catch (error) {
    console.error('Error en toggleSuspendUserAdmin service:', error);
    throw error;
  }
}
