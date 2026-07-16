const esLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.startsWith('192.168.') || 
                window.location.hostname.startsWith('10.') || 
                window.location.hostname === '::1';

const BaseURL = import.meta.env.VITE_BASE_URL_PRODUCCION || 
  (esLocal ? 'http://localhost:3000' : 'https://huellas-uio.vercel.app/_/backend');

const API_URL = `${BaseURL}/api/pets`;

/**
 * Obtiene la lista completa de todas las mascotas (Catálogo público).
 */
export async function getAllPets() {
  try {
    const response = await fetch(`${API_URL}/viewAllPets`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener el catálogo de mascotas.');
    }
    return data;
  } catch (error) {
    console.error('Error en getAllPets service:', error);
    throw error;
  }
}

/**
 * Obtiene las mascotas registradas por el rescatista autenticado.
 */
export async function getOurPets(token) {
  try {
    const response = await fetch(`${API_URL}/viewOurPets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener tus rescatados.');
    }
    return data;
  } catch (error) {
    console.error('Error en getOurPets service:', error);
    throw error;
  }
}

/**
 * Agrega una nueva mascota (Rescatista).
 */
export async function addPet(mascotaData, token) {
  try {
    const response = await fetch(`${API_URL}/addPet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(mascotaData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar la mascota.');
    }
    return data;
  } catch (error) {
    console.error('Error en addPet service:', error);
    throw error;
  }
}

/**
 * Elimina una mascota (Rescatista).
 */
export async function deletePet(id, token) {
  try {
    const response = await fetch(`${API_URL}/deletePet/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar la mascota.');
    }
    return data;
  } catch (error) {
    console.error('Error en deletePet service:', error);
    throw error;
  }
}

/**
 * Sube una imagen de mascota desde el computador (Rescatista).
 * Envía el archivo en un FormData bajo la clave 'imagen'.
 */
export async function uploadMascotaImage(file, token) {
  try {
    const formData = new FormData();
    formData.append('imagen', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // NOTA: No definas Content-Type manualmente aquí. 
        // El navegador establecerá el boundary correcto para multipart/form-data.
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al subir la imagen.');
    }
    return data; // Retorna { url: 'https://...' }
  } catch (error) {
    console.error('Error en uploadMascotaImage service:', error);
    throw error;
  }
}
