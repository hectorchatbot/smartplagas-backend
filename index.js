require('dotenv').config();
const express = require('express');
const { MessagingResponse } = require('twilio').twiml;
const flujo = require('./chatbot-flujo.json');

const app = express();

// ✅ Asegúrate de que esto esté ANTES del webhook para leer el body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sesiones = {};

app.post('/webhook-whatsapp', (req, res) => {
  console.log("📥 Mensaje recibido en webhook");
  console.log("🔹 req.body completo:", req.body); // 👈 Aquí está el log completo
  console.log("🔹 From:", req.body.From);
  console.log("🔹 Body:", req.body.Body);

  const from = req.body.From;
  const mensaje = req.body.Body?.trim();
  const twiml = new MessagingResponse();

  if (!from || !mensaje) {
    console.error("❌ Datos inválidos en el request");
    twiml.message("Error: Datos inválidos.");
    return res.type('text/xml').send(twiml.toString());
  }

  if (!sesiones[from]) {
    sesiones[from] = {
      nodoActual: flujo[0].id,
      variables: {},
    };
  }

  const sesion = sesiones[from];
  let nodo = flujo.find(n => n.id === sesion.nodoActual);

  if (!nodo) {
    twiml.message("⚠️ Error interno. Nodo no encontrado.");
    return res.type('text/xml').send(twiml.toString());
  }

  if (nodo.type === "mensaje") {
    let texto = nodo.content;
    Object.keys(sesion.variables).forEach(v => {
      texto = texto.replaceAll(`{${v}}`, sesion.variables[v]);
    });
    twiml.message(texto);
    sesion.nodoActual = nodo.nextId;

  } else if (nodo.type === "pregunta") {
    sesion.variables[nodo.variableName] = mensaje;
    sesion.nodoActual = nodo.nextId;

  } else if (nodo.type === "condicional") {
    const opcion = nodo.options.find(opt =>
      mensaje.toLowerCase().includes(opt.text.toLowerCase())
    );

    if (!opcion) {
      twiml.message("❌ Opción no válida. Por favor, responde con una de las opciones indicadas.");
      return res.type('text/xml').send(twiml.toString());
    }

    sesion.nodoActual = opcion.nextId;
  }

  const siguiente = flujo.find(n => n.id === sesion.nodoActual);

  if (siguiente) {
    let texto = siguiente.content || "";

    Object.keys(sesion.variables).forEach(v => {
      texto = texto.replaceAll(`{${v}}`, sesion.variables[v]);
    });

    if (["mensaje", "pregunta", "condicional"].includes(siguiente.type)) {
      twiml.message(texto);
    }

  } else {
    twiml.message("✅ Gracias. Hemos completado tu atención.");
    delete sesiones[from];
  }

  return res.type('text/xml').send(twiml.toString());
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ SmartPlagas Bot funcionando en puerto ${PORT}`);
});
