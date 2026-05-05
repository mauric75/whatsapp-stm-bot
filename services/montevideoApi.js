async function obtenerProximosBuses(stopId) {
  const datos = {
    '1192': [
      { linea: '79', destino: 'Géant', horaDesc: '19:18' },
      { linea: '21', destino: 'Portones', horaDesc: '19:45' },
      { linea: '15', destino: 'Centro', horaDesc: '20:12' },
    ],
    '4190': [
      { linea: '3', destino: 'Tres Cruces', horaDesc: '19:20' },
      { linea: '10', destino: 'Mercado', horaDesc: '19:50' },
    ],
    '1000': [
      { linea: '1', destino: 'Malvín', horaDesc: '19:30' },
      { linea: '2', destino: 'Tres Cruces', horaDesc: '20:00' },
    ]
  };

  if (datos[stopId]) {
    return datos[stopId];
  }

  return [
    { linea: '79', destino: 'Centro', horaDesc: '19:15' },
    { linea: '21', destino: 'Portones', horaDesc: '19:45' },
  ];
}

module.exports = { obtenerProximosBuses };
