require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { MessagingResponse } = require("twilio").twiml;
const twilio = require("twilio");
const cors = require("cors"); // 🔥 NUEVO

const app = express();

// 🔥 MIDDLEWARES
app.use(cors()); // 🔥 IMPORTANTE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// 🔥 TWILIO CLIENT
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// 🔥 FLOWISE
const FLOWISE_URL = "https://cloud.flowiseai.com/api/v1/prediction/9d661c85-afa4-4b96-b608-8f152f5eb0a4";

// 🔥 GUARDAR MENSAJES
let messages = [];

// =======================
// WEBHOOK WHATSAPP
// =======================
app.post("/webhook", async (req, res) => {
  const incomingMsg = (req.body.Body || "").toLowerCase();
  const from = req.body.From;

  console.log("📩 Mensaje:", incomingMsg);

  messages.push({
    from,
    message: incomingMsg,
    date: new Date()
  });

  let reply = "";

  if (
    incomingMsg.includes("humano") ||
    incomingMsg.includes("asesor")
  ) {
    reply = "👨‍💼 Un asesor de FacturaCore te atenderá pronto.";

  } else {
    try {
      const response = await axios.post(FLOWISE_URL, {
        question: incomingMsg,
      });

      reply = response.data.text || "Error IA";

    } catch (error) {
      console.log("❌ FLOWISE ERROR:", error.message);
      reply = "⚠️ Error IA";
    }
  }

  const twiml = new MessagingResponse();
  twiml.message(reply);

  res.type("text/xml");
  res.send(twiml.toString());
});

// =======================
// VER MENSAJES
// =======================
app.get("/messages", (req, res) => {
  res.json(messages);
});

// =======================
// ENVIAR MENSAJE (PANEL)
// =======================
app.post("/send", async (req, res) => {
  console.log("📤 Intento enviar");

  const { to, message } = req.body;

  if (!to || !message) {
    return res.json({ ok: false, error: "Faltan datos" });
  }

  try {
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
      body: message
    });

    console.log("✅ Enviado a:", to);

    res.json({ ok: true });

  } catch (error) {
    console.log("❌ TWILIO ERROR:", error.message);
    res.json({ ok: false, error: error.message });
  }
});

// =======================
app.listen(process.env.PORT || 3000, () => {
  console.log("🔥 FacturaCore PRO corriendo");
});
