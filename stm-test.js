const axios = require("axios");
const cheerio = require("cheerio");

// 🔍 Obtener datos STM (versión robusta)
async function obtenerSTM(parada) {
  try {
    const url = `https://www.montevideo.gub.uy/transporte/stm/busquedaParada?parada=${parada}`;

    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "es-ES,es;q=0.9"
      },
      timeout: 10000
    });

    const $ = cheerio.load(html);
    const resultados = [];

    // 🔥 método 1: intentar con filas
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

    // 🔥 método 2: fallback (parseo global)
    if (resultados.length === 0) {
      const text = $("body").text().replace(/\s+/g, " ");

      const matches = [...text.matchAll(/(\d+)\s+([A-Za-zÁÉÍÓÚÑáéíóúñ\s]+?)\s+(\d+\s*(min|m))/gi)];

      matches.forEach(m => {
        resultados.push({
          linea: m[1],
          destino: m[2].trim(),
          tiempo: m[3]
        });
      });
    }

    return resultados.slice(0, 5);

  } catch (error) {
    console.error("❌ Error STM:", error.message);
    return [];
  }
}

// 📲 Formatear salida
function formatear(data, parada) {
  if (!data.length) {
    return `⚠️ No hay datos para la parada ${parada}`;
  }

  return `📍 Parada ${parada}\n\n` +
    data.map(b =>
      `🚌 ${b.linea} → ${b.destino}\n⏱ ${b.tiempo}`
    ).join("\n\n");
}

// 🚀 Ejecutar
(async () => {
  const parada = process.argv[2] || "4190";

  console.log("🔎 Consultando STM...\n");

  const data = await obtenerSTM(parada);

  console.log("DEBUG RAW:", data); // 👈 útil si falla

  const resultado = formatear(data, parada);

  console.log("\n" + resultado);
})();