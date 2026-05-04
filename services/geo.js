const paradas = require('../data/stops.json');

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = aRadianes(lat2 - lat1);
  const dLon = aRadianes(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function aRadianes(grados) {
  return grados * (Math.PI / 180);
}

function obtenerParadasCercanas(lat, lng, limite = 3, radioKm = 2) {
  const conDistancia = paradas.map(parada => ({
    ...parada,
    distancia: calcularDistancia(lat, lng, parada.lat, parada.lng)
  }));
  return conDistancia
    .filter(p => p.distancia <= radioKm)
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, limite);
}

module.exports = { obtenerParadasCercanas };
