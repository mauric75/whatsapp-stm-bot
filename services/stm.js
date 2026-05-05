const axios = require("axios");
const cheerio = require("cheerio");

const cache = new Map();

// 🔍 Obtener STM
async function obtenerSTM(parada) {
  const key = `p_${parada}`;

  // ⚡ cache 15s
  if (cache.has(key)) {
    const { data, time } = cache.get(key);
    if (Date.now() - time < 15000) return data;
  }

  try {
    const url = `https://www.montevideo.gub.uy/transporte/stm/busquedaParada?parada=${parada}`;

    const { data: html } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000
    });

    const $ = cheerio.load(html);
    const resultados = [];

    $("tr").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();

      const match = text.match(/(\d+)\s+(.+?)\s+(\d+\s*(min|m))/i);

      if (match) {
        resultados.push({
          linea: match[1],
          destino: match[2],
          tiempo: match[3]
        });
      }
    });

    // fallback
    if (resultados.length === 0) {
      const text = $("body").text().replace(/\s+/g, " ");
      const matches = [...text.matchAll(/(\d+)\s+(.+?)\s+(\d+\s*(min|m))/gi)];

      matches.forEach(m => {
        resultados.push({
          linea: m[1],
          destino: m[2],
          tiempo: m[3]
        });
      });
    }

    const finalData = resultados.slice(0, 5);

    cache.set(key, { data: finalData, time: Date.now() });

    return finalData;

  } catch (error) {
    console.error("STM error:", error.message);
    return [];
  }
}

// 📲 Formateo
function formatearSTM(data, parada, lineaFiltro = null) {
  if (!data.length) {
    return `⚠️ No hay datos para la parada ${parada}`;
  }

  if (lineaFiltro) {
    data = data.filter(b => b.linea === lineaFiltro);
  }

  if (!data.length) {
    return `⚠️ No hay resultados para la línea ${lineaFiltro} en parada ${parada}`;
  }

  return `📍 Parada ${parada}\n\n` +
    data.map(b =>
      `🚌 ${b.linea} → ${b.destino}\n⏱ ${b.tiempo}`
    ).join("\n\n");
}

module.exports = { obtenerSTM, formatearSTM };