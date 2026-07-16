const supabase = require('../supabase');

/**
 * Listar todos los usuarios (Perfiles).
 */
const viewUsers = async (req, res) => {
  try {
    const dbAdmin = supabase.admin;
    if (!dbAdmin) {
      return res.status(500).json({ error: 'Servicio administrativo de Supabase no configurado.' });
    }

    const { data: perfiles, error } = await dbAdmin
      .from('perfiles')
      .select('*')
      .order('creado_el', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(perfiles);
  } catch (err) {
    console.error('Error en viewUsers:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Obtener perfil de un usuario específico por su ID.
 */
const searchUser = async (req, res) => {
  const { id } = req.params;

  try {
    const dbAdmin = supabase.admin;
    if (!dbAdmin) {
      return res.status(500).json({ error: 'Servicio administrativo de Supabase no configurado.' });
    }

    const { data: perfil, error } = await dbAdmin
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    return res.status(200).json(perfil);
  } catch (err) {
    console.error('Error en searchUser:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Registrar un nuevo usuario desde el panel de administración.
 */
const createUser = async (req, res) => {
  const { email, password, nombre_completo, rol } = req.body || {};

  if (!email || !password || !nombre_completo) {
    return res.status(400).json({
      error: 'Por favor, proporciona email, password y nombre_completo.'
    });
  }

  const rolesValidos = ['admin_fundacion', 'rescatista', 'adoptante'];
  const rolFinal = rol ? rol.toLowerCase() : 'adoptante';
  if (!rolesValidos.includes(rolFinal)) {
    return res.status(400).json({ error: 'Rol inválido.' });
  }

  try {
    const dbAdmin = supabase.admin;
    if (!dbAdmin) {
      return res.status(500).json({ error: 'Servicio administrativo de Supabase no configurado.' });
    }

    // Crear usuario en Auth de forma directa con confirmación de correo automática
    const { data: userAuth, error: authError } = await dbAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: nombre_completo.toUpperCase(),
        rol: rolFinal
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    return res.status(201).json({
      message: 'Usuario registrado exitosamente desde administración.',
      user: userAuth.user
    });
  } catch (err) {
    console.error('Error en admin createUser:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre_completo, telefono, direccion, rol, nombre_organizacion, perfil_completado } = req.body || {};

  const updates = {};
  if (nombre_completo !== undefined) updates.nombre_completo = nombre_completo;
  if (telefono !== undefined) updates.telefono = telefono;
  if (direccion !== undefined) updates.direccion = direccion;
  if (rol !== undefined) updates.rol = rol.toLowerCase();
  if (nombre_organizacion !== undefined) updates.nombre_organizacion = nombre_organizacion;
  if (perfil_completado !== undefined) updates.perfil_completado = perfil_completado;

  try {
    const dbAdmin = supabase.admin;
    if (!dbAdmin) {
      return res.status(500).json({ error: 'Servicio administrativo de Supabase no configurado.' });
    }

    // Si se modifica el rol, actualizar también los metadatos de Auth
    if (updates.rol) {
      const { error: authUpdateError } = await dbAdmin.auth.admin.updateUserById(id, {
        user_metadata: { rol: updates.rol }
      });
      if (authUpdateError) {
        console.warn('Advertencia al actualizar el rol en Auth metadata:', authUpdateError.message);
      }
    }

    const { data: perfilActualizado, error } = await dbAdmin
      .from('perfiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'Usuario actualizado por el administrador.',
      perfil: perfilActualizado
    });
  } catch (err) {
    console.error('Error en admin updateUser:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Eliminar usuario permanentemente.
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const dbAdmin = supabase.admin;
    if (!dbAdmin) {
      return res.status(500).json({ error: 'Servicio administrativo de Supabase no configurado.' });
    }

    const { error } = await dbAdmin.auth.admin.deleteUser(id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Usuario y perfil eliminados de forma permanente.' });
  } catch (err) {
    console.error('Error en admin deleteUser:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Suspender / Banear cuenta de usuario temporal o permanentemente en Supabase Auth.
 */
const suspendAccount = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body || {}; // 'suspend' o 'reactivate'

  try {
    const dbAdmin = supabase.admin;
    if (!dbAdmin) {
      return res.status(500).json({ error: 'Servicio administrativo de Supabase no configurado.' });
    }

    
    const banDuration = action === 'reactivate' ? 'none' : '87600h';

    const { data: userAuth, error } = await dbAdmin.auth.admin.updateUserById(id, {
      ban_duration: banDuration
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Actualizar el estado de la columna suspendido en la tabla perfiles
    const { error: profileError } = await dbAdmin
      .from('perfiles')
      .update({ suspendido: action !== 'reactivate' })
      .eq('id', id);

    if (profileError) {
      console.error('Error al actualizar el estado de suspensión en perfiles:', profileError.message);
    }

    return res.status(200).json({
      message: action === 'reactivate' ? 'Cuenta reactivada exitosamente.' : 'Cuenta suspendida exitosamente.',
      user: userAuth.user
    });
  } catch (err) {
    console.error('Error en suspendAccount:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Listar todas las mascotas del sistema (Acceso Admin).
 */
const viewPets = async (req, res) => {
  try {
    const { data: mascotas, error } = await supabase
      .from('mascotas')
      .select('*, registrado_por_perfil:perfiles(nombre_completo)')
      .order('creado_el', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(mascotas);
  } catch (err) {
    console.error('Error en admin viewPets:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Eliminar cualquier mascota 
 */
const deletePets = async (req, res) => {
  const { id } = req.params;

  try {
    const dbAdmin = supabase.admin || supabase;
    const { error } = await dbAdmin
      .from('mascotas')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Mascota eliminada por el administrador.' });
  } catch (err) {
    console.error('Error en admin deletePets:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Listar todos los estados de adopción a nivel global.
 */
const viewStateAdoption = async (req, res) => {
  try {
    const { data: solicitudes, error } = await supabase
      .from('solicitudes_adopcion')
      .select('*, adoptante:perfiles!adoptante_id(nombre_completo), mascota:mascotas(nombre)')
      .order('creado_el', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(solicitudes);
  } catch (err) {
    console.error('Error en viewStateAdoption:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Obtener detalles de una solicitud de adopción específica.
 */
const viewStateAdoptionById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: solicitud, error } = await supabase
      .from('solicitudes_adopcion')
      .select('*, adoptante:perfiles!adoptante_id(nombre_completo, telefono, direccion), mascota:mascotas(nombre, foto_url)')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(solicitud);
  } catch (err) {
    console.error('Error en viewStateAdoptionById:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  viewUsers,
  searchUser,
  createUser,
  updateUser,
  deleteUser,
  suspendAccount,
  viewPets,
  deletePets,
  viewStateAdoption,
  viewStateAdoptionById
};
