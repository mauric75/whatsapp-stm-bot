const axios = require('axios');

let tokenCache = null;
let tokenExpiracion = null;

async function obtenerToken() {
  if (tokenCache && tokenExpiracion && tokenExpiracion > Date.now()) {
    return tokenCache;
  }

  try {
    const respuesta = await axios.post(
      'https://mvdapi-auth.montevideo.gub.uy/auth/realms/pci/protocol/openid-connect/token',
      'grant_type=client_credentials',
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        auth: {
          username: process.env.STM_CLIENT_ID,
          password: process.env.STM_CLIENT_SECRET
        }
      }
    );

    tokenCache = respuesta.data.access_token;
    tokenExpiracion = Date.now() + (respuesta.data.expires_in - 300) * 1000;
    console.log('🔑 Token obtenido exitosamente');
    return tokenCache;
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message);
    throw new Error('No se pudo autenticar con la API de Montevideo');
  }
}

async function obtenerProximosBuses(stopId) {
  try {
    const token = await obtenerToken();
    const respuesta = await axios.get(
      `https://api.montevideo.gub.uy/transporteRest/buses/busstops/${stopId}/upcomingbuses`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return respuesta.data;
  } catch (error) {
    console.error(`❌ Error consultando parada ${stopId}:`, error.message);
    throw new Error(`No se pudo consultar la parada ${stopId}`);
  }
}

module.exports = { obtenerProximosBuses };
