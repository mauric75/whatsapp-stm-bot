const axios = require('axios');

// Función para obtener el tipo de día actual (HABIL, SABADO, DOMINGO)
function obtenerTipoDia() {
  const hoy = new Date();
  const dia = hoy.getDay();
  
  if (dia === 0) return 'DOMINGO';
  if (dia === 6) return 'SABADO';
  return 'HABIL';
}

// Función para obtener la hora actual en formato HH:MM
function obtenerHoraActual() {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

async function obtenerProximosBuses(stopId) {
  try {
    const tipoDia = obtenerTipoDia();
    const horaActual = obtenerHoraActual();
    
    const url = `http://www.montevideo.gub.uy/transporteRest/pasadas/${stopId}/${tipoDia}/${horaActual}`;
    
    const respuesta = await axios.get(url);
    
    // Transformar la respuesta al formato esperado
    const buses = respuesta.data.map(pasada => ({
      linea: pasada.linea,
      destino: pasada.destino,
      horaDesc: pasada.horaDesc,
      hora: pasada.hora
    }));
    
    return buses;
  } catch (error) {
    console.error(`❌ Error consultando parada ${stopId}:`, error.message);
    throw new Error(`No se pudo consultar la parada ${stopId}`);
  }
}

module.exports = { obtenerProximosBuses };