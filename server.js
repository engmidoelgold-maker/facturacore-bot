import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const FLOWISE_URL = "https://cloud.flowiseai.com/api/v1/prediction/9d661c85-afa4-4b96-b608-8f152f5eb0a4";

app.post("/webhook", async (req, res) => {
  try {
    const userMessage = req.body.Body;

    const response = await fetch(FLOWISE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: userMessage }),
    });

    const data = await response.json();

    const reply =
      data.text ||
      data.answer ||
      "Lo siento, no pude responder en este momento.";

    res.set("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Message>${reply}</Message>
      </Response>
    `);
  } catch (error) {
    console.error(error);
    res.send(`
      <Response>
        <Message>Error en el servidor</Message>
      </Response>
    `);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});