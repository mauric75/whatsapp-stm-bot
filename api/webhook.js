const twilio = require('twilio');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const mensaje = req.body.Body ? req.body.Body.trim() : '';

  let respuestaTexto = '';

  const datos = {
    '1192': '?? Parada 1192\n?? 79 ? Géant (19:18)\n?? 21 ? Portones (19:45)\n?? 15 ? Centro (20:12)',
    '4190': '?? Parada 4190\n?? 3 ? Tres Cruces (19:20)\n?? 10 ? Mercado (19:50)',
    '1000': '?? Plaza Independencia\n?? 1 ? Malvín (19:30)\n?? 2 ? Tres Cruces (20:00)',
  };

  if (/^\d+$/.test(mensaje) && datos[mensaje]) {
    respuestaTexto = datos[mensaje];
  } else if (mensaje.toLowerCase() === 'ayuda') {
    respuestaTexto = '?? TransitMVD\nMandá un número de parada:\n• 1192\n• 4190\n• 1000';
  } else {
    respuestaTexto = '?? TransitMVD\nMandá un número de parada o escribí *ayuda*';
  }

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(respuestaTexto);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
};
