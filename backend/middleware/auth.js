const supabase = require('../supabase');

//Middleware para autenticación de usuarios que utilizan el token de Supabase
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acceso no autorizado. Por favor, provee una cabecera Authorization: Bearer <token>'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validar el token y obtener la información del usuario desde Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido o expirado.'
      });
    }

    // Adjuntar la información del usuario a la request
    req.user = user;

    // Adjuntar cliente Supabase autenticado con el JWT para que respete RLS en la base de datos
    req.supabase = supabase.getClientWithToken(token);
    next();
  } catch (err) {
    console.error('Error verificando la autenticación:', err);
    return res.status(500).json({
      error: 'Error interno del servidor al procesar la autenticación.'
    });
  }
};
//FALTA COMPLETAR Y PRBAR LOGICA DEL ROL, PARA QUE SOLO LOS USUARIOS CON ROL ACCEDAN A SUS RUTAS
const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      let currentRol;
      const dbClient = req.supabase || supabase;
      const { data: perfilExistente, error } = await dbClient
        .from('perfiles')
        .select('rol')
        .eq('id', req.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`[Middleware] Perfil no encontrado para el usuario ${req.user.id}. Creando uno por defecto...`);
          const defaultRol = req.user.user_metadata?.rol || 'adoptante';
          const profileData = {
            id: req.user.id,
            nombre_completo: req.user.user_metadata?.full_name || req.user.user_metadata?.name || 'Usuario Nuevo',
            rol: defaultRol,
            perfil_completado: false
          };

          const adminClient = supabase.admin || dbClient;
          const { data: nuevoPerfil, error: insertError } = await adminClient
            .from('perfiles')
            .insert(profileData)
            .select('rol')
            .single();

          if (insertError) {
            console.error('Error creando perfil faltante en middleware:', insertError);
            return res.status(500).json({
              error: 'Error interno del servidor al inicializar tu perfil.'
            });
          }

          currentRol = nuevoPerfil.rol;
        } else {
          console.error('Error obteniendo el rol del usuario:', error);
          return res.status(500).json({
            error: 'Error interno del servidor al verificar permisos.'
          });
        }
      } else {
        currentRol = perfilExistente?.rol;
      }

      if (!currentRol) {
        return res.status(403).json({
          error: 'No se encontró un rol asignado para este usuario.'
        });
      }

      // Sincronizar la metadata de Auth y la tabla perfiles
      const metadataRol = req.user.user_metadata?.rol;
      if (metadataRol && currentRol !== metadataRol) {
        console.log(`[Middleware] Sincronizando rol en BD: ${currentRol} -> ${metadataRol}`);
        const adminClient = supabase.admin || dbClient;
        const { data: updatedProfile, error: updateError } = await adminClient
          .from('perfiles')
          .update({ rol: metadataRol })
          .eq('id', req.user.id)
          .select('rol')
          .single();

        if (!updateError && updatedProfile) {
          currentRol = updatedProfile.rol;
        }
      }

      req.user.role = currentRol; // Asignamos el rol obtenido a req.user

      // Mapeamos 'admin' a 'admin_fundacion' para compatibilidad con las rutas y base de datos
      const requiredRoles = roles.map(r => r === 'admin' ? 'admin_fundacion' : r);

      if (!requiredRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'No tienes permisos para acceder a esta ruta.'
        });
      }

      next();
    } catch (err) {
      console.error('Excepción al autorizar rol:', err);
      return res.status(500).json({
        error: 'Error interno del servidor al procesar la autorización.'
      });
    }
  };
};

module.exports = { requireAuth, authorizeRoles };
