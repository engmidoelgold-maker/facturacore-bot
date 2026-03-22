require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { MessagingResponse } = require("twilio").twiml;
const twilio = require("twilio");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// 🔥 FLOWISE
const FLOWISE_URL = "https://cloud.flowiseai.com/api/v1/prediction/9d661c85-afa4-4b96-b608-8f152f5eb0a4";

// 🔥 TWILIO CLIENT
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post("/webhook", async (req, res) => {
  const incomingMsg = (req.body.Body || "").toLowerCase();
  const from = req.body.From;

  console.log("📩 Mensaje:", incomingMsg);
  console.log("👤 Cliente:", from);

  let reply = "";

  // 🔴 DETECTAR HUMANO
  if (
    incomingMsg.includes("humano") ||
    incomingMsg.includes("asesor") ||
    incomingMsg.includes("agente")
  ) {
    reply = "👨‍💼 Te estoy conectando con un asesor de FacturaCore, espera un momento...";
    console.log("🚨 ESCALADO A HUMANO:", from);

    try {
      // 🔥 NOTIFICACIÓN A TI (CAMBIA TU NÚMERO)
      await client.messages.create({
        from: "whatsapp:+14155238886",
        to: "whatsapp:+525566199990", // 👈 PON TU NÚMERO REAL
        body: `🚨 Cliente necesita ayuda:\n\nMensaje: ${incomingMsg}\nCliente: ${from}`
      });

      console.log("✅ Notificación enviada a tu WhatsApp");
    } catch (error) {
      console.error("❌ Error enviando notificación:", error.message);
    }

  } else {
    try {
      const response = await axios.post(FLOWISE_URL, {
        question: incomingMsg,
      });

      reply = response.data.text || "No pude responder correctamente.";
      console.log("🤖 Respuesta AI:", reply);

    } catch (error) {
      console.error("❌ ERROR FLOWISE:", error.message);
      reply = "⚠️ Error conectando con la IA.";
    }
  }

  const twiml = new MessagingResponse();
  twiml.message(reply);

  res.type("text/xml");
  res.send(twiml.toString());
});

// 🚀 SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🔥 FacturaCore AI conectado con Flowise en puerto " + PORT);
});
