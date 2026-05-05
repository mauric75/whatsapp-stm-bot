const twilio = require('twilio');
const { obtenerParadasCercanas } = require('../services/geo');
const { obtenerSTM, formatearSTM } = require("../services/stm");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const mensaje = req.body.Body ? req.body.Body.trim() : '';
  const latitud = req.body.Latitude;
  const longitud = req.body.Longitude;
  let respuestaTexto = '';

  try {
    // 📍 UBICACIÓN
    if (latitud && longitud) {
      const paradasCercanas = obtenerParadasCercanas(parseFloat(latitud), parseFloat(longitud));

      if (paradasCercanas.length === 0) {
        respuestaTexto = '📍 No encontré paradas cercanas a tu ubicación.';
      } else {
        respuestaTexto = '📍 *Paradas cercanas:*\n\n';

        for (const parada of paradasCercanas.slice(0, 3)) {
          respuestaTexto += `🚏 *${parada.nombre}*\n`;

          const data = await obtenerSTM(parada.id);

          if (data.length) {
            data.slice(0, 2).forEach(b => {
              respuestaTexto += `   🚌 ${b.linea} → ${b.tiempo}\n`;
            });
          } else {
            respuestaTexto += '   ⚠️ Sin buses\n';
          }

          respuestaTexto += '\n';
        }
      }
    }

    // 🔍 DETECTAR PARADA + LÍNEA
    else {
      const matchParada = mensaje.match(/\b\d{3,5}\b/);
      const matchLinea = mensaje.match(/\b\d{2,3}\b/);

      if (matchParada) {
        const parada = matchParada[0];
        const linea = (matchLinea && matchLinea[0] !== parada) ? matchLinea[0] : null;

        const data = await obtenerSTM(parada);

        respuestaTexto = formatearSTM(data, parada, linea);
      }

      // 🆘 AYUDA
      else if (mensaje.toLowerCase() === 'ayuda') {
        respuestaTexto =
`🚌 *TransitMVD Bot*

📍 Mandá:
• Un número de parada → 4190
• Parada + línea → 4190 103
• Tu ubicación 📍

⚡ Ejemplos:
• 1192
• 4190 103
• ayuda`;
      }

      // 🤖 DEFAULT
      else {
        respuestaTexto =
`🤖 *TransitMVD Bot*

Mandame un número de parada o tu ubicación 📍
Escribí *ayuda* para más info.`;
      }
    }

  } catch (error) {
    console.error('Error:', error);
    respuestaTexto = '❌ Error al obtener datos. Probá de nuevo.';
  }

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(respuestaTexto);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
};
