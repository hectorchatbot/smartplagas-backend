const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend funcionando 🚀');
});
app.post('/send-whatsapp', (req, res) => {
  const { to, message } = req.body;

  console.log('Petición recibida:', to, message);

  // Simulación de envío (aquí pondrás tu lógica real con Twilio después)
  if (!to || !message) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  res.json({ success: true, message: `Mensaje enviado a ${to}` });
});


const PORT = process.env.PORT || 3001;
app.post('/send-whatsapp', (req, res) => {
  const { to, message } = req.body;

  // Aquí podrías integrar Twilio o lo que quieras para enviar el mensaje.
  console.log('Número destino:', to);
  console.log('Mensaje:', message);

  res.json({
    status: 'success',
    message: `Mensaje enviado a ${to}: ${message}`
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
