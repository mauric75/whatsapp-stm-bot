const axios = require('axios');

// Genera tiempos simulados pero realistas
function generarBusesSimulados(stopId) {
  const lineas = ['3', '9', '30', '64', '121', '148', '526', 'G', '405', '538'];
  const destinos = [
    '18 de Julio y Centro',
    'Bulevar Artigas',
    'Tres Cruces',
    'Av. Italia',
    'Ruta 3',
    'Cerro',
    'Zona de Unions',
    'Peñarol',
    'Av. de las Américas'
  ];
  
  const buses = [];
  const ahora = new Date();
  
  // Generar 5-8 buses próximos
  for (let i = 0; i < Math.floor(Math.random() * 4) + 5; i++) {
    const minutosProximos = Math.floor(Math.random() * 25) + (i * 3) + 2;
    const horaProxima = new Date(ahora.getTime() + minutosProximos * 60000);
    
    const horas = String(horaProxima.getHours()).padStart(2, '0');
    const minutos = String(horaProxima.getMinutes()).padStart(2, '0');
    
    buses.push({
      linea: lineas[Math.floor(Math.random() * lineas.length)],
      destino: destinos[Math.floor(Math.random() * destinos.length)],
      horaDesc: `${horas}:${minutos}`,
      hora: parseInt(`${horas}${minutos}`)
    });
  }
  
  return buses;
}

async function obtenerProximosBuses(stopId) {
  try {
    // Simular pequeño delay como si fuera una llamada real
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`🚌 Buses simulados para parada ${stopId}`);
    return generarBusesSimulados(stopId);
  } catch (error) {
    console.error(`❌ Error consultando parada ${stopId}:`, error.message);
    throw new Error(`No se pudo consultar la parada ${stopId}`);
  }
}

module.exports = { obtenerProximosBuses };