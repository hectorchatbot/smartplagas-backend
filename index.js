const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend funcionando 🚀');
});

app.post('/send-whatsapp', async (req, res) => {
  const { to, message } = req.body;

  console.log('Petición recibida:', to, message);

  if (!to || !message) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const twilioResponse = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${to}`
    });

    console.log('Mensaje enviado:', twilioResponse.sid);

    res.json({
      success: true,
      sid: twilioResponse.sid,
      message: `Mensaje enviado a ${to}`
    });
  } catch (error) {
    console.error('Error al enviar WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
