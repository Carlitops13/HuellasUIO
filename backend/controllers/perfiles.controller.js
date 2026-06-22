const supabase = require('../supabase');

const obtenerMiPerfil = async (req, res) => {
  try {
    // Usamos el cliente autenticado para respetar RLS (Row Level Security)
    const { data: perfil, error } = await req.supabase
      .from('perfiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      // Si el error es que la fila no existe (código PGRST116)
      if (error.code === 'PGRST116') {
        const profileData = {
          id: req.user.id,
          nombre_completo: req.user.user_metadata?.full_name || '',
          rol: req.user.user_metadata?.rol || 'adoptante',
          telefono: '',
          direccion: '',
          perfil_completado: false
        };

        // Intentar usar supabase.admin si está configurado (evita temas de RLS)
        const dbClient = supabase.admin || req.supabase;
        const { data: nuevoPerfil, error: insertError } = await dbClient
          .from('perfiles')
          .insert(profileData)
          .select()
          .single();

        if (insertError) {
          console.warn('Error al insertar perfil con admin, intentando con cliente autenticado:', insertError.message);

          const { data: nuevoPerfilAuth, error: insertErrorAuth } = await req.supabase
            .from('perfiles')
            .insert(profileData)
            .select()
            .single();

          if (insertErrorAuth) {
            console.error('Error final al insertar perfil:', insertErrorAuth);
            return res.status(400).json({ error: insertErrorAuth.message });
          }
          return res.status(200).json(nuevoPerfilAuth);
        }

        return res.status(200).json(nuevoPerfil);
      }
      return res.status(400).json({ error: error.message });
    }

    // Sincronizar rol si en la base de datos es adoptante pero en auth metadata es diferente (ej. rescatista o admin)
    const metadataRol = req.user.user_metadata?.rol;
    if (perfil && metadataRol && perfil.rol !== metadataRol) {
      console.log(`Sincronizando rol en BD para el usuario ${req.user.id}: ${perfil.rol} -> ${metadataRol}`);
      const dbClient = supabase.admin || req.supabase;
      const { data: perfilActualizado, error: updateError } = await dbClient
        .from('perfiles')
        .update({ rol: metadataRol })
        .eq('id', req.user.id)
        .select()
        .single();

      if (!updateError && perfilActualizado) {
        return res.status(200).json(perfilActualizado);
      }
    }

    return res.status(200).json(perfil);
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const actualizarMiPerfil = async (req, res) => {
  const { nombre_completo, telefono, direccion, nombre_organizacion } = req.body || {};

  try {
    // Solo el propio usuario pueda actualizar su perfil 
    const { data: perfilActualizado, error } = await req.supabase
      .from('perfiles')
      .update({
        nombre_completo,
        telefono,
        direccion,
        nombre_organizacion,
        perfil_completado: true // Marcar el perfil como completado al guardar datos
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'Perfil actualizado con éxito.',
      perfil: perfilActualizado
    });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  obtenerMiPerfil,
  actualizarMiPerfil
};
