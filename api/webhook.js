const twilio = require('twilio');
const { obtenerProximosBuses } = require('../services/montevideoApi');
const { obtenerParadasCercanas } = require('../services/geo');

function formatearRespuesta(stopId, nombreParada, buses) {
  let texto = `🚏 Parada *${nombreParada || stopId}*\n\n`;
  if (!buses || buses.length === 0) {
    texto += '😕 No hay buses próximos en este momento.\n';
    return texto;
  }
  buses.slice(0, 5).forEach(b => {
    const minutos = Math.floor(b.eta / 60);
    texto += `🚌 *${b.linea}* → ${minutos} min\n`;
  });
  return texto;
}

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
    if (latitud && longitud) {
      const paradasCercanas = obtenerParadasCercanas(parseFloat(latitud), parseFloat(longitud));
      if (paradasCercanas.length === 0) {
        respuestaTexto = '📍 No encontré paradas cercanas a tu ubicación.\nProbá en otra zona.';
      } else {
        respuestaTexto = '📍 *Paradas más cercanas:*\n\n';
        for (const parada of paradasCercanas) {
          respuestaTexto += `🚏 *${parada.nombre}* (${parada.distancia.toFixed(2)} km)\n`;
          try {
            const buses = await obtenerProximosBuses(parada.id);
            if (buses && buses.length > 0) {
              buses.slice(0, 3).forEach(b => {
                const min = Math.floor(b.eta / 60);
                respuestaTexto += `   🚌 ${b.linea} → ${min} min\n`;
              });
            } else {
              respuestaTexto += '   ⚠️ Sin buses próximos\n';
            }
          } catch {
            respuestaTexto += '   ❌ Error al consultar\n';
          }
          respuestaTexto += '\n';
        }
      }
    }
    else if (/^\d+$/.test(mensaje)) {
      try {
        const buses = await obtenerProximosBuses(mensaje);
        respuestaTexto = formatearRespuesta(mensaje, `Parada ${mensaje}`, buses);
      } catch {
        respuestaTexto = '❌ No encontré esa parada. Verificá el número.\nEjemplo: 1192';
      }
    }
    else if (mensaje.toLowerCase() === 'ayuda') {
      respuestaTexto = '🚌 *¿Cuándo pasa el bondi?*\n\n📝 *Opciones:*\n• Mandá un número de parada (ej: 1192)\n• Compartí tu ubicación 📍\n\n💡 *Ejemplos de paradas:*\n• 1192 - 19 de Junio y E. Raíz\n• 4190 - 18 de Julio y Convención\n• 1000 - Plaza Independencia\n\n⚡ *Comandos:*\n• *ayuda* - Ver este mensaje';
    }
    else {
      respuestaTexto = '🤖 *TransitMVD Bot*\n\nMandame un número de parada o compartí tu ubicación.\nEscribí *ayuda* para más info.';
    }
  } catch (error) {
    console.error('Error:', error);
    respuestaTexto = '❌ Ocurrió un error inesperado. Intentá de nuevo más tarde.';
  }

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(respuestaTexto);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
};
