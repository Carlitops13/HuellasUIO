// socket.js
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

// Inicializa tu cliente de Supabase con las variables de entorno
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { 
      origin: "*", // Cambia esto por la URL específica de tu frontend en producción
      methods: ["GET", "POST"]
    }
  });

  // MIDDLEWARE: Valida el token de Supabase antes de permitir la conexión al socket
  io.use(async (socket, next) => {
    try {
      // El cliente debe enviar el token en la propiedad 'auth' al inicializarse
      const token = socket.handshake.auth.token; 
      
      if (!token) {
        return next(new Error("Autenticación fallida: Token no proporcionado"));
      }

      // Limpiamos el prefijo 'Bearer ' si el cliente lo incluye
      const jwt = token.startsWith('Bearer ') ? token.slice(7) : token;

      // Validamos el token directamente con la API de autenticación de Supabase
      const { data: { user }, error } = await supabase.auth.getUser(jwt);

      if (error || !user) {
        return next(new Error("Token inválido o expirado"));
      }

      // Guardamos los datos seguros del usuario directamente dentro del objeto socket
      // Nota: user.id coincide con el id referenciado en tu tabla 'perfiles'
      socket.usuario = { id: user.id, email: user.email };
      next();
    } catch (err) {
      console.error("Error en middleware de autenticación:", err);
      next(new Error("Error interno en la autenticación del socket"));
    }
  });

  // EVENTOS DEL SOCKET (Solo se ejecuta si el middleware llamó a next())
  io.on('connection', (socket) => {
    console.log(`Usuario autenticado conectado: ${socket.usuario.email} (${socket.id})`);

    // 1. Unirse a una sala de chat con validación de seguridad e historial
    socket.on('unirse_chat', async ({ chatId }) => {
      const usuarioId = socket.usuario.id;

      try {
        // VALIDACIÓN: Verificamos si el usuario realmente pertenece a este chat en 'chat_participantes'
        const { data: participante, error: errorParticipante } = await supabase
          .from('chat_participantes')
          .select('id')
          .eq('chat_id', chatId)
          .eq('perfil_id', usuarioId)
          .single();

        if (errorParticipante || !participante) {
          console.log(`Acceso denegado: El usuario ${usuarioId} no pertenece al chat ${chatId}`);
          return socket.emit('error_chat', { mensaje: 'No tienes permiso para acceder a este chat o el chat no existe.' });
        }

        // Si es un participante válido, se une a la sala del socket
        socket.join(chatId);
        console.log(`Usuario ${socket.usuario.email} autorizado y unido al chat ${chatId}`);

        // Consultar el historial de mensajes guardados en Supabase para este chat
        const { data: historial, error: errorHistorial } = await supabase
          .from('mensajes')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true })
          .limit(50);

        if (!errorHistorial && historial) {
          // Enviamos el historial únicamente al usuario que se acaba de conectar
          socket.emit('historial_chat', historial);
        } else if (errorHistorial) {
          console.error("Error al recuperar historial:", errorHistorial);
        }

      } catch (err) {
        console.error("Error en el evento unirse_chat:", err);
        socket.emit('error_chat', { mensaje: 'Error interno del servidor al intentar cargar el chat.' });
      }
    });

    // 2. Recibir un nuevo mensaje, guardarlo de forma persistente y retransmitirlo
    socket.on('enviar_mensaje', async ({ chatId, texto }) => {
      // Validación rápida de contenido vacío
      if (!texto || texto.trim() === "") return;

      try {
        // Insertamos el mensaje en la base de datos de Supabase
        const { data: nuevoMensaje, error } = await supabase
          .from('mensajes')
          .insert([
            { 
              chat_id: chatId, 
              usuario_id: socket.usuario.id, // ID seguro extraído del Bearer Token
              texto: texto.trim()
            }
          ])
          .select()
          .single(); // Nos devuelve el objeto exacto insertado (con id y created_at reales)

        if (!error && nuevoMensaje) {
          // Emitimos el mensaje a todos los usuarios que están dentro de la sala de este chat
          io.to(chatId).emit('recibir_mensaje', nuevoMensaje);
        } else {
          console.error("Error al guardar mensaje en Supabase:", error);
          socket.emit('error_chat', { mensaje: 'No se pudo enviar el mensaje.' });
        }
      } catch (err) {
        console.error("Error en el evento enviar_mensaje:", err);
      }
    });

    // Manejo de la desconexión del cliente
    socket.on('disconnect', () => {
      console.log(`Usuario ${socket.usuario.email} se ha desconectado`);
    });
  });

  return io;
}

// Función opcional por si necesitas emitir eventos desde rutas tradicionales de Express
function getIo() {
  if (!io) {
    throw new Error("Socket.io no ha sido inicializado aún.");
  }
  return io;
}

module.exports = { initSocket, getIo };
