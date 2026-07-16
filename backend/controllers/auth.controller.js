const { createClient } = require('@supabase/supabase-js');
const supabase = require('../supabase');

/**
 * Registra un nuevo usuario en Supabase Auth.

 */
const registro = async (req, res) => {
  const { email, password, nombre_completo, rol } = req.body || {};

  if (!email || !password || !nombre_completo) {
    return res.status(400).json({
      error: 'Por favor, proporciona email, password y nombre_completo.'
    });
  }

  // Validar rol si es provisto
  const rolesValidos = ['admin_fundacion', 'rescatista', 'adoptante'];
  const rolFinal = rol ? rol.toLowerCase() : 'adoptante';
  if (rol && !rolesValidos.includes(rolFinal)) {
    return res.status(400).json({
      error: `Rol inválido. Debe ser uno de: ${rolesValidos.join(', ')}`
    });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(), // Convertimos el email a minúsculas para evitar problemas de mayúsculas/minúsculas
      password,
      options: {
        data: {
          full_name: nombre_completo.toUpperCase(), // Convertimos el nombre completo a mayúsculas antes de guardarlo
          rol: rolFinal
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor verifica tu correo si es necesario.',
      user: data.user,
      session: data.session
    });
  } catch (err) {
    console.error('Error en registro:', err);
    return res.status(500).json({ error: 'Error interno del servidor al registrar usuario.' });
  }
};

/**
 * Inicia sesión de un usuario con email y password.
 * Retorna los datos de sesión (incluyendo access_token y refresh_token).
 */
const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      error: 'Por favor, proporciona email y password.'
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      session: data.session,
      user: data.user
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
};

/**
 * Cierre de sesión.
 * Invalida la sesión actual en Supabase utilizando el token provisto.
 */
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      // Establecemos temporalmente la sesión en el cliente para poder ejecutar el signOut 
      const { error } = await supabase.auth.signOut(token);
      if (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    return res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
  } catch (err) {
    console.error('Error en logout:', err);
    return res.status(500).json({ error: 'Error interno del servidor al cerrar sesión.' });
  }
};

/**
 * Actualiza la contraseña del usuario en Supabase Auth.
 */
const actualizarPassword = async (req, res) => {
  const { oldPassword, password } = req.body || {};

  if (!oldPassword) {
    return res.status(400).json({
      error: 'Por favor, proporciona la contraseña antigua.'
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      error: 'La nueva contraseña debe tener al menos 6 caracteres.'
    });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    // Crear un cliente temporal de Supabase para verificar las credenciales actuales
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Iniciar sesión con el email del usuario y la contraseña antigua
    const { data: loginData, error: loginError } = await tempClient.auth.signInWithPassword({
      email: req.user.email.toLowerCase(),
      password: oldPassword
    });

    if (loginError) {
      return res.status(400).json({
        error: 'La contraseña antigua es incorrecta.'
      });
    }

    // Una vez autenticado exitosamente en el cliente temporal, procedemos a actualizar la contraseña
    const { error: updateError } = await tempClient.auth.updateUser({ password });

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    return res.status(200).json({
      message: 'Contraseña actualizada exitosamente.'
    });
  } catch (err) {
    console.error('Error al actualizar contraseña:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Recupera la contraseña del usuario.
 * Envia un correo con el flujo de reset password de Supabase.
 */
const recuperarClave = async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({
      error: 'Por favor, proporciona el email.'
    });
  }
  const urlEmail = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5173/recuperarClave'
  : 'https://huellas-uio.vercel.app/recuperarClave';

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: urlEmail // URL a la que el usuario será redirigido después de hacer clic en el enlace del correo
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'Si el correo existe en el sistema, recibirás un email para recuperar tu contraseña.',
      data
    });
  } catch (err) {
    console.error('Error en recuperarClave:', err);
    return res.status(500).json({ error: 'Error interno del servidor al recuperar la contraseña.' });
  }
};

//confirmar recuperacion de clave|
const confirmarRecuperarClave = async (req, res) => {

  const { token, password } = req.body || {};

  if (!token) {
    return res.status(400).json({ error: 'Por favor, proporciona el token de recuperación.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    // Usar cliente temporal 
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // 1. Crear la sesión del usuario en Supabase 
    const { data: sessionData, error: sessionError } = await tempClient.auth.setSession({
      access_token: token,
      refresh_token: token
    });

    if (sessionError) {
      return res.status(400).json({ error: 'El token de recuperación es inválido o ha expirado.' });
    }

    // 2. Actualizar la contraseña del usuario en Supabase 
    const { data: userData, error: updateError } = await tempClient.auth.updateUser({
      password: password
    });

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // 3. Respuesta exitosa devolviendo los datos del usuario modificado
    return res.status(200).json({
      message: 'Contraseña recuperada exitosamente.',
      data: userData
    });

  } catch (err) {
    console.error('Error en confirmarRecuperarClave:', err);
    return res.status(500).json({ error: 'Error interno del servidor al recuperar la contraseña.' });
  }
};


module.exports = {
  registro,
  login,
  logout,
  actualizarPassword,
  recuperarClave,
  confirmarRecuperarClave
};


