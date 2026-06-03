const supabase = require('../supabase');

//Token de Supabase, para que respete RLS en la base de datos
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

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(req.user);
      return res.status(403).json({
        message: "No tienes permisos para acceder a esta ruta"
      });
    }
    next();
  };
};

module.exports = { requireAuth, authorizeRoles };
