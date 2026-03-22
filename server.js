require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { MessagingResponse } = require("twilio").twiml;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// 🔥 TU FLOWISE ENDPOINT (CAMBIA ESTO)
const FLOWISE_URL = "https://cloud.flowiseai.com/api/v1/prediction/9d661c85-afa4-4b96-b608-8f152f5eb0a4";

app.post("/webhook", async (req, res) => {
  console.log("🔥 MENSAJE RECIBIDO");

  const msg = req.body.Body;
  const from = req.body.From;

  console.log("Cliente:", from);
  console.log("Mensaje:", msg);

  const twilio = require("twilio");

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: from,
      body: "🔥 FacturaCore: Mensaje recibido, te responderemos pronto."
    });

    console.log("✅ Respuesta enviada");
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  res.send("ok");
});, async (req, res) => {
  const incomingMsg = req.body.Body;

  console.log("📩 Mensaje recibido:", incomingMsg);

  let aiReply = "⚠️ Error temporal, intenta de nuevo.";

  try {
    // 🚀 LLAMADA A FLOWISE (TU AI PRO)
    const response = await axios.post(FLOWISE_URL, {
      question: incomingMsg,
    });

    aiReply = response.data.text || "No pude responder correctamente.";

    console.log("🤖 Respuesta AI:", aiReply);

  } catch (error) {
    console.error("❌ ERROR FLOWISE:", error.message);
    aiReply = "⚠️ Error conectando con la IA.";
  }

  const twiml = new MessagingResponse();
  twiml.message(aiReply);

  res.type("text/xml");
  res.send(twiml.toString());
});

// 🚀 SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🔥 FacturaCore AI conectado con Flowise en puerto " + PORT);
});
