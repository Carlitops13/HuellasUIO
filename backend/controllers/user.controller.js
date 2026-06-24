const supabase = require('../supabase');

/**
 * Enviar solicitud de adopción.
 */

const verEstadoPostulaciones = async (req, res) => {
  try {
    const { data: solicitudes, error } = await req.supabase
      .from('solicitudes_adopcion')
      .select('id, mascota_id, estado_solicitud, creado_el')
      .eq('adoptante_id', req.user.id)
      .order('creado_el', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(solicitudes);
  } catch (err) {
    console.error('Error en verEstadoPostulaciones:', err);
    return res.status(500).json({ error: 'Error interno del servidor al consultar el estado de las postulaciones.' });
  }
};

const postularAdopcion = async (req, res) => {
  const { mascota_id, motivo_adopcion, tiene_otras_mascotas, tipo_vivienda } = req.body || {};

  if (!mascota_id || !motivo_adopcion || tiene_otras_mascotas === undefined || !tipo_vivienda) {
    return res.status(400).json({
      error: 'Por favor, proporciona mascota_id, motivo_adopcion, tiene_otras_mascotas y tipo_vivienda.'
    });
  }

  try {
    // Insertar la solicitud. 
    const { data: solicitud, error } = await req.supabase
      .from('solicitudes_adopcion')
      .insert({
        mascota_id,
        adoptante_id: req.user.id,
        motivo_adopcion,
        tiene_otras_mascotas,
        tipo_vivienda,
        estado_solicitud: 'pendiente'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Solicitud de adopción enviada exitosamente.',
      solicitud
    });
  } catch (err) {
    console.error('Error en postular Adopcion:', err);
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.' });
  }
};

/**
 * Consultar el estado de las solicitudes enviadas por el adoptante.
 */
const verMisSolicitudes = async (req, res) => {
  try {
    // Obtenemos solicitudes con información de la mascota
    const { data: solicitudes, error } = await req.supabase
      .from('solicitudes_adopcion')
      .select('*, mascota:mascotas(nombre, foto_url, especie, sector_quito)')
      .eq('adoptante_id', req.user.id)
      .order('creado_el', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(solicitudes);
  } catch (err) {
    console.error('Error en verMisSolicitudes:', err);
    return res.status(500).json({ error: 'Error interno del servidor al consultar solicitudes.' });
  }
};

/**
 * Consultar las solicitudes de adopción recibidas por el rescatista.
 */
const verSolicitudesRecibidas = async (req, res) => {
  try {
    // Obtener mascotas registradas por el rescatista autenticado
    const { data: misMascotas, error: errMascotas } = await req.supabase
      .from('mascotas')
      .select('id')
      .eq('registrado_por', req.user.id);

    if (errMascotas) {
      return res.status(400).json({ error: errMascotas.message });
    }

    if (!misMascotas || misMascotas.length === 0) {
      return res.status(200).json([]);
    }

    const mascotaIds = misMascotas.map(m => m.id);

    //  Obtener solicitudes de adopción asociadas a esas mascotas
    const { data: solicitudes, error: errSolicitudes } = await req.supabase
      .from('solicitudes_adopcion')
      .select('*, adoptante:perfiles!adoptante_id(nombre_completo, telefono, direccion), mascota:mascotas(nombre, foto_url, registrado_por)')
      .in('mascota_id', mascotaIds)
      .order('creado_el', { ascending: false });

    if (errSolicitudes) {
      return res.status(400).json({ error: errSolicitudes.message });
    }

    return res.status(200).json(solicitudes);
  } catch (err) {
    console.error('Error en verSolicitudesRecibidas:', err);
    return res.status(500).json({ error: 'Error interno del servidor al consultar las solicitudes recibidas.' });
  }
};

/**
 * Responder a una solicitud de adopción (Aprobar o Rechazar).
 */
const responderSolicitud = async (req, res) => {
  const { idSolicitud } = req.params;
  const { estado_solicitud, comentarios_admin } = req.body || {};

  if (!estado_solicitud) {
    return res.status(400).json({ error: 'Por favor, proporciona el estado_solicitud.' });
  }

  const estadosValidos = ['pendiente', 'en_revision', 'aprobada', 'rechazada'];
  const estadoFinal = estado_solicitud.toLowerCase();

  if (!estadosValidos.includes(estadoFinal)) {
    return res.status(400).json({ error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` });
  }

  try {
    // RLS se encargará de verificar que el rescatista sea el creador de la mascota
    const { data: solicitudActualizada, error } = await req.supabase
      .from('solicitudes_adopcion')
      .update({
        estado_solicitud: estadoFinal,
        comentarios_admin: comentarios_admin || '',
        revisado_por: req.user.id,
        fecha_revision: new Date().toISOString()
      })
      .eq('id', idSolicitud)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Si la solicitud de adopción es aprobada, actualizar automáticamente el estado de la mascota a "adoptado"
    if (estadoFinal === 'aprobada') {
      const { error: petUpdateError } = await req.supabase
        .from('mascotas')
        .update({ estado_adopcion: 'adoptado' })
        .eq('id', solicitudActualizada.mascota_id);
      
      if (petUpdateError) {
        console.error('Error al actualizar estado de adopción de la mascota:', petUpdateError);
      }
    }

    return res.status(200).json({
      message: 'Solicitud actualizada exitosamente.',
      solicitud: solicitudActualizada
    });
  } catch (err) {
    console.error('Error en responderSolicitud:', err);
    return res.status(500).json({ error: 'Error interno del servidor al responder la solicitud.' });
  }
};

/**
 * Eliminar perfil de usuario.
 */
const eliminarMiPerfil = async (req, res) => {
  try {
    const dbAdmin = supabase.admin;
    if (!dbAdmin) {
      return res.status(500).json({ error: 'Servicio administrativo de Supabase no configurado.' });
    }

    // Eliminamos de Auth (el trigger borrará el perfil)
    const { error } = await dbAdmin.auth.admin.deleteUser(req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Tu cuenta y perfil han sido eliminados de forma permanente.' });
  } catch (err) {
    console.error('Error en eliminarMiPerfil:', err);
    return res.status(500).json({ error: 'Error interno del servidor al eliminar la cuenta.' });
  }
};

module.exports = {
  postularAdopcion,
  verMisSolicitudes,
  verSolicitudesRecibidas,
  responderSolicitud,
  eliminarMiPerfil,
  verEstadoPostulaciones
};
