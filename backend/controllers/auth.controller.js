const { createClient } = require('@supabase/supabase-js');
const supabase = require('../supabase');

/**
 * Registra un nuevo usuario en Supabase Auth.

 */
const registro = async (req, res) => {
  const { email, password, nombre_completo } = req.body;

  if (!email || !password || !nombre_completo) {
    return res.status(400).json({
      error: 'Por favor, proporciona email, password y nombre_completo.'
    });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Guardamos nombre completo  en la  para que el trigger de Supabase lo tome
        data: {
          full_name: nombre_completo
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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Por favor, proporciona email y password.'
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
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
  const { oldPassword, password } = req.body;

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
      email: req.user.email,
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

module.exports = {
  registro,
  login,
  logout,
  actualizarPassword
};
