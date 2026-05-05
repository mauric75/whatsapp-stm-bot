// Datos simulados realistas de paradas comunes en Montevideo
const datosParadas = {
  '1192': {
    nombre: '19 de Junio y E. Raíz',
    buses: [
      { linea: '79', destino: 'Géant', hora: 1918, horaDesc: '19:18' },
      { linea: '21', destino: 'Portones', hora: 1929, horaDesc: '19:29' },
      { linea: '79', destino: 'Portones', hora: 1938, horaDesc: '19:38' },
      { linea: '2', destino: 'Centro', hora: 2045, horaDesc: '20:45' },
      { linea: '15', destino: 'Pocitos', hora: 2112, horaDesc: '21:12' },
    ]
  },
  '4190': {
    nombre: '18 de Julio y Convención',
    buses: [
      { linea: '3', destino: 'Tres Cruces', hora: 1903, horaDesc: '19:03' },
      { linea: '10', destino: 'Mercado Agrícola', hora: 1920, horaDesc: '19:20' },
      { linea: '11', destino: 'Pocitos', hora: 1947, horaDesc: '19:47' },
      { linea: '3', destino: 'Tres Cruces', hora: 2051, horaDesc: '20:51' },
      { linea: '10', destino: 'Mercado Agrícola', hora: 2138, horaDesc: '21:38' },
    ]
  },
  '1000': {
    nombre: 'Plaza Independencia',
    buses: [
      { linea: '1', destino: 'Malvín', hora: 1912, horaDesc: '19:12' },
      { linea: '2', destino: 'Tres Cruces', hora: 1934, horaDesc: '19:34' },
      { linea: '5', destino: 'Pocitos', hora: 1956, horaDesc: '19:56' },
      { linea: '1', destino: 'Malvín', hora: 2023, horaDesc: '20:23' },
      { linea: '7', destino: 'Belvedere', hora: 2107, horaDesc: '21:07' },
    ]
  }
};

function generarBusesSimulados(stopId) {
  const ahora = new Date();
  const horaActual = ahora.getHours() * 100 + ahora.getMinutes();
  
  // Si tenemos datos de esa parada, usarlos
  if (datosParadas[stopId]) {
    const busesBase = datosParadas[stopId].buses;
    return busesBase.map(b => {
      let nuevoHora = b.hora;
      if (nuevoHora <= horaActual) {
        nuevoHora += 600;
      }
      if (nuevoHora > 2359) nuevoHora = nuevoHora - 2400;
      
      return {
        ...b,
        hora: nuevoHora,
        horaDesc: `${String(Math.floor(nuevoHora / 100)).padStart(2, '0')}:${String(nuevoHora % 100).padStart(2, '0')}`
      };
    }).sort((a, b) => a.hora - b.hora);
  }
  
  // Si no, generar datos aleatorios realistas
  const buses = [];
  let hora = horaActual;
  for (let i = 0; i < 5; i++) {
    hora += 8 + Math.random() * 5;
    if (hora > 2359) hora = 600;
    
    const lineas = ['1', '2', '3', '5', '7', '10', '15', '21', '79'];
    const destinos = ['Centro', 'Pocitos', 'Malvín', 'Tres Cruces', 'Géant', 'Portones', 'Belvedere'];
    
    buses.push({
      linea: lineas[Math.floor(Math.random() * lineas.length)],
      destino: destinos[Math.floor(Math.random() * destinos.length)],
      hora: Math.floor(hora),
      horaDesc: `${String(Math.floor(hora / 100)).padStart(2, '0')}:${String(hora % 100).padStart(2, '0')}`
    });
  }
  return buses;
}

async function obtenerProximosBuses(stopId) {
  try {
    const buses = generarBusesSimulados(stopId);
    return buses || [];
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return [
      { linea: '79', destino: 'Géant', hora: 1918, horaDesc: '19:18' },
      { linea: '21', destino: 'Portones', hora: 1945, horaDesc: '19:45' },
      { linea: '15', destino: 'Centro', hora: 2012, horaDesc: '20:12' },
    ];
  }
}

module.exports = { obtenerProximosBuses };
