const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

let paradas = {};

try {
  const paradasPath = path.join(__dirname, '../data/paradas.json');
  paradas = JSON.parse(fs.readFileSync(paradasPath, 'utf8'));
} catch (e) {
  paradas = {
    '1192': '19 de Junio y E. Raíz',
    '4190': '18 de Julio y Convención',
    '1000': 'Plaza Independencia'
  };
}

const busesSimulados = {
  '1192': [
    { linea: '79', destino: 'Géant', hora: '19:18' },
    { linea: '21', destino: 'Portones', hora: '19:45' },
    { linea: '15', destino: 'Centro', hora: '20:12' }
  ],
  '4190': [
    { linea: '3', destino: 'Tres Cruces', hora: '19:20' },
    { linea: '10', destino: 'Mercado', hora: '19:50' }
  ],
  '1000': [
    { linea: '1', destino: 'Malvín', hora: '19:30' },
    { linea: '2', destino: 'Tres Cruces', hora: '20:00' }
  ],
  '2000': [
    { linea: '5', destino: 'Pocitos', hora: '19:25' },
    { linea: '7', destino: 'Belvedere', hora: '20:05' }
  ],
  '3000': [
    { linea: '11', destino: 'Pocitos', hora: '19:35' },
    { linea: '14', destino: 'Malvín', hora: '20:15' }
  ],
  '5000': [
    { linea: '2', destino: 'Centro', hora: '19:40' },
    { linea: '9', destino: 'Obelisco', hora: '20:25' }
  ],
  '6000': [
    { linea: '1', destino: 'Malvín', hora: '19:50' },
    { linea: '4', destino: 'Tres Cruces', hora: '20:30' }
  ],
  '7000': [
    { linea: '3', destino: 'Tres Cruces', hora: '19:15' },
    { linea: '12', destino: 'Pocitos', hora: '19:55' }
  ],
  '8000': [
    { linea: '8', destino: 'Belvedere', hora: '19:45' },
    { linea: '6', destino: 'Centro', hora: '20:20' }
  ]
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const mensaje = req.body.Body ? req.body.Body.trim() : '';
  let respuestaTexto = '';

  if (/^\d+$/.test(mensaje)) {
    const stopId = mensaje;
    if (paradas[stopId]) {
      const nombreParada = paradas[stopId];
      const buses = busesSimulados[stopId] || [];
      
      respuestaTexto = `?? Parada ${stopId}\n${nombreParada}\n\n`;
      
      if (buses.length > 0) {
        buses.forEach(b => {
          respuestaTexto += `?? ${b.linea} ? ${b.destino} (${b.hora})\n`;
        });
      } else {
        respuestaTexto += 'Sin datos de buses en este momento.';
      }
    } else {
      respuestaTexto = `? Parada ${stopId} no encontrada.\n\nParadas disponibles:\n1192, 4190, 1000, 2000, 3000, 5000, 6000, 7000, 8000\n\nEscribí *ayuda* para más info.`;
    }
  } else if (mensaje.toLowerCase() === 'ayuda') {
    respuestaTexto = '?? *TransitMVD Bot*\n\n?? *Cómo usar:*\nMandá un número de parada (ej: 1192)\n\n?? *Ejemplos:*\n• 1192 - 19 de Junio y E. Raíz\n• 3000 - Pocitos y 26 de Marzo\n• 5000 - Malvín y Canelones\n\n?? Datos simulados (esperando API real)';
  } else {
    respuestaTexto = '?? TransitMVD\n\nMandá un número de parada o escribí *ayuda*';
  }

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(respuestaTexto);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
};
