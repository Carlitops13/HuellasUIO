// Asegúrate de requerir e inicializar Stripe correctamente con tu clave secreta
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const session = async (req, res) => {
  try {
    // Capturamos los datos del usuario inyectados por tus middlewares de Supabase
    const id = req.user?.id;
     const nombre = req.user?.user_metadata?.nombre || req.user?.user_metadata?.full_name;
    const valor = req.body.valor;

    if (!valor) {
      return res.status(400).json({ error: "El valor está vacío." });
    }
    if (!nombre) {
      return res.status(400).json({ error: "No hay nombre de usuario autenticado." });
    }

   
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Donación / Pago HuellitasUIO",
            description: `Pago realizado por ${nombre}`,
          },
          unit_amount: Math.round(valor * 100), 
        },
        quantity: 1,
      },
    ];

    // Creamos la sesión de checkout enviando el ID del usuario en la metadata
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: line_items,
      success_url: `${process.env.CLIENT_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
      metadata: {
        userId: id,          // 👈 Guardamos el ID de Supabase de forma segura
        userName: nombre,
        source: "huellitasUIO"
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Error al crear sesión:", error);
    res.status(500).json({ error: error.message });
  }
};

const webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  
  let event;

  try {
    // Valida que la petición venga estrictamente de Stripe usando el Raw Body (Buffer)
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Si Stripe confirma que el pago fue exitoso
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    console.log("✅ Pago confirmado");
    console.log("Session ID:", session.id);
    
    // Recuperamos los datos del usuario de Supabase desde la metadata devuelta por Stripe
    const idUsuarioSupabase = session.metadata.userId;
    const nombreUsuario = session.metadata.userName;
    const montoPagado = session.amount_total / 100; // Stripe devuelve centavos, pasamos a dólares

    console.log(`Cliente identificado: ${nombreUsuario} (ID: ${idUsuarioSupabase})`);
    console.log(`Monto procesado: $${montoPagado}`);
  }

  // Respondemos a Stripe con un 200 OK para confirmar que recibimos el evento
  res.json({ received: true });
};

module.exports = {
  session,
  webhook
};
