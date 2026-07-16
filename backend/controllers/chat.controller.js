// Reemplaza la línea del import por esta:
const { InferenceClient } = require("@huggingface/inference");


const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = process.env.HF_MODEL || "openai/gpt-oss-20b";
const HF_PROVIDER = process.env.HF_PROVIDER || "auto";

const hf = new InferenceClient(HF_TOKEN);

const modos={
    "veterinario":"Eres un asesor experto exclusivamente en Veterinaria o cuidado de mascotas. Si el usuario te pregunta sobre cualquier otra materia (como cocina, política, programación, historia o charlas casuales, entre otras), debes responder textualmente: 'Lo siento, solo puedo ayudarte con dudas sobre Veterinaria y mascotas'. No intentes responder, justificar ni dar consejos fuera de este dominio bajo ninguna circunstancia."
}

const obtenerRespuestaLocal = (texto = "") => {
  const textoLimpio = texto.toLowerCase();
  let respuesta = "Gracias por compartirlo. Para una orientación más precisa, te recomiendo consultar con un veterinario. Si notas fiebre, vómitos persistentes, dolor o falta de apetito, busca atención urgente.";

  if (textoLimpio.includes("comida") || textoLimpio.includes("aliment")) {
    respuesta = "Una dieta balanceada y agua limpia son clave. Evita dar alimentos humanos, chocolate, cebolla o ajo, y consulta al veterinario si hay cambios bruscos en el apetito.";
  } else if (textoLimpio.includes("vacuna") || textoLimpio.includes("vacunas")) {
    respuesta = "Las vacunas ayudan a prevenir enfermedades. Mantén el calendario al día y consulta al veterinario para ajustar el plan según la edad y el estado de salud.";
  } else if (textoLimpio.includes("herida") || textoLimpio.includes("sangre")) {
    respuesta = "Si hay una herida abierta, sangrado o dolor intenso, es mejor acudir a una clínica veterinaria lo antes posible.";
  } else if (textoLimpio.includes("baño") || textoLimpio.includes("ducha")) {
    respuesta = "El baño debe ser suave y con productos adecuados para mascotas. Si tu mascota se muestra muy nerviosa o tiene irritación en la piel, consulta con el veterinario.";
  }

  return respuesta;
};

const chat = async (req, res) => {
  try {
    const { messages, modo } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Debes enviar un arreglo messages con al menos un mensaje."
      });
    }

    const safeMessages = messages
      .filter((m) => m && typeof m.content === "string")
      .map((m) => ({
        role: ["system", "user", "assistant"].includes(m.role) ? m.role : "user",
        content: m.content.slice(0, 3000)
      }))
      .slice(-10);

    const modoSeleccionado = modos[modo] || modos.veterinario;
    const ultimoMensaje = safeMessages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";

    if (!HF_TOKEN) {
      return res.json({
        answer: obtenerRespuestaLocal(ultimoMensaje),
        fallback: true,
        detail: "Falta HF_TOKEN en el archivo .env"
      });
    }

    const response = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        { role: "system", content: modoSeleccionado },
        ...safeMessages
      ],
      max_tokens: 500,
      temperature: 0.5,
      provider: HF_PROVIDER !== "auto" ? HF_PROVIDER : undefined
    });

    const answer = response.choices?.[0]?.message?.content || response.generated_text || "No se recibió respuesta del modelo.";

    res.json({ answer, fallback: false });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    const fallbackMessage = obtenerRespuestaLocal(req.body?.messages?.slice(-1)[0]?.content || "");
    res.json({
      answer: fallbackMessage,
      fallback: true,
      detail: error.message
    });
  }
};


module.exports={
  chat
}