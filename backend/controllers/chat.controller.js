const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function buscarOCrearChat(req, res) {
  try {
    // 1. Obtener IDs (El tuyo viene del token de la ruta; el otro viene del botón del front)
    const miUsuarioId = req.user.id; // ID del usuario autenticado (tú)
    const otroUsuarioId = req.body.otroUsuarioId; // ID del adoptante/dueño

    if (!otroUsuarioId) {
      return res.status(400).json({ error: "Falta el ID del otro usuario" });
    }

    // 2. BUSCAR: Ver si ya existe un chat donde participen AMBOS usuarios
    // Buscamos los chats del 'otroUsuarioId'
    const { data: chatsDelOtro, error: errOtro } = await supabase
      .from('chat_participantes')
      .select('chat_id')
      .eq('perfil_id', otroUsuarioId);

    if (errOtro) throw errOtro;

    if (chatsDelOtro && chatsDelOtro.length > 0) {
      const listaIdsChats = chatsDelOtro.map(c => c.chat_id);

      // Verificamos si en alguno de esos mismos chats también estás tú
      const { data: chatComun, error: errComun } = await supabase
        .from('chat_participantes')
        .select('chat_id')
        .in('chat_id', listaIdsChats)
        .eq('perfil_id', miUsuarioId)
        .maybeSingle(); // Retorna el objeto si existe, o null si no

      if (errComun) throw errComun;

      // Si el chat ya existía, devolvemos su ID de inmediato
      if (chatComun) {
        return res.status(200).json({ chatId: chatComun.chat_id, esNuevo: false });
      }
    }

    // 3. CREAR: Si no se encontró un chat común, creamos uno nuevo
    const { data: nuevoChat, error: errNuevoChat } = await supabase
      .from('chats')
      .insert([{}]) // Inserta fila vacía para generar el UUID
      .select()
      .single();

    if (errNuevoChat) throw errNuevoChat;

    const nuevoChatId = nuevoChat.id;

    // 4. ASOCIAR PARTICIPANTES: Insertamos a ambos usuarios en la tabla intermedia
    const { error: errParticipantes } = await supabase
      .from('chat_participantes')
      .insert([
        { chat_id: nuevoChatId, perfil_id: miUsuarioId },
        { chat_id: nuevoChatId, perfil_id: otroUsuarioId }
      ]);

    if (errParticipantes) throw errParticipantes;

    // Devolvemos el ID del chat recién creado
    return res.status(201).json({ chatId: nuevoChatId, esNuevo: true });

  } catch (error) {
    console.error("Error en buscarOCrearChat:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { buscarOCrearChat };
