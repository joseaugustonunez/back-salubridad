import { pipeline } from "@xenova/transformers";
import Establecimiento from "../models/establecimientoModel.js";
import Categoria from "../models/categoriaModel.js";

// Función de similitud coseno CON CONVERSIÓN A ARRAY
function cosineSimilarity(a, b) {
  // Convertir a arrays si no lo son
  const arrayA = Array.isArray(a) ? a : Array.from(Object.values(a));
  const arrayB = Array.isArray(b) ? b : Array.from(Object.values(b));
  
  const dot = arrayA.reduce((sum, v, i) => sum + v * arrayB[i], 0);
  const normA = Math.sqrt(arrayA.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(arrayB.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}

// Cargar el modelo local solo una vez
const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

// 💬 Función principal del chatbot
export const procesarMensaje = async (req, res) => {
  try {
    const message = (req.body?.message || req.body?.mensaje || "").trim();
    console.log("📩 Mensaje recibido:", message);
    
    if (!message) {
      return res.status(400).json({ error: "Mensaje vacío" });
    }

    // 🧠 Generar embedding local del mensaje
    const embeddingResult = await embedder(message);
    const queryEmbedding = Array.from(embeddingResult[0][0]); // ← CONVERTIR A ARRAY

    // 📦 Obtener todos los establecimientos con embedding
    let all = await Establecimiento.find({
      embedding: { $exists: true, $ne: [], $ne: null },
    })
      .populate("categoria", "nombre")
      .populate("tipo", "nombre")
      .populate("ubicacion", "nombre direccion")
      .populate("horario")
      .populate("comentarios")
      .lean();

    console.log("📊 Establecimientos con embedding encontrados:", all.length);

    // 🆘 FALLBACK: Si no hay embeddings, buscar por texto
    if (!all.length) {
      console.log("⚠️ No hay embeddings, usando búsqueda por texto...");
      
      all = await Establecimiento.find({
        $or: [
          { nombre: { $regex: message, $options: "i" } },
          { descripcion: { $regex: message, $options: "i" } },
        ]
      })
        .populate("categoria", "nombre")
        .populate("tipo", "nombre")
        .populate("ubicacion", "nombre direccion")
        .populate("horario")
        .populate("comentarios")
        .lean();

      console.log("📊 Establecimientos encontrados por texto:", all.length);

      if (all.length) {
        const sugeridos = all.slice(0, 5).map(r => r.nombre).join(", ");
        return res.json({
          respuesta: `Encontré estos lugares: ${sugeridos}`,
          found: all.length,
          results: all.slice(0, 10),
          metodo: "busqueda_texto"
        });
      }

      return res.json({
        respuesta: "No encontré establecimientos relacionados con tu búsqueda.",
        found: 0,
        results: [],
      });
    }

    // 🔍 Calcular similitud coseno
    const scored = all.map((e) => ({
      ...e,
      score: cosineSimilarity(queryEmbedding, e.embedding),
    }));

    const resultados = scored.sort((a, b) => b.score - a.score).slice(0, 10);

    console.log("🎯 Mejor score:", resultados[0]?.score);
    console.log("🏆 Top 3:", resultados.slice(0, 3).map(r => `${r.nombre} (${r.score.toFixed(3)})`));

    let respuesta = "No encontré lugares muy relacionados con tu búsqueda.";
    const umbral = 0.3;
    
    if (resultados.length && resultados[0].score > umbral) {
      const sugeridos = resultados
        .filter(r => r.score > umbral)
        .slice(0, 5)
        .map((r) => r.nombre)
        .join(", ");
      respuesta = `Encontré estos lugares que podrían interesarte: ${sugeridos}`;
    } else if (resultados.length) {
      const sugeridos = resultados.slice(0, 3).map((r) => r.nombre).join(", ");
      respuesta = `Estos lugares podrían ser de tu interés: ${sugeridos}`;
    }

    return res.json({
      respuesta,
      found: resultados.length,
      results: resultados,
      metodo: "similitud_semantica"
    });
  } catch (err) {
    console.error("❌ Error procesarMensaje:", err);
    return res.status(500).json({ 
      error: "Error al procesar el mensaje",
      detalle: err.message 
    });
  }
};

// 🔄 Función para generar embeddings
export const generarEmbeddings = async (req, res) => {
  try {
    const sinEmbedding = await Establecimiento.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: [] },
        { embedding: null }
      ]
    }).populate("categoria", "nombre");

    console.log(`🔄 Procesando ${sinEmbedding.length} establecimientos sin embedding...`);

    if (sinEmbedding.length === 0) {
      return res.json({
        mensaje: "Todos los establecimientos ya tienen embeddings",
        procesados: 0
      });
    }

    let procesados = 0;
    for (const est of sinEmbedding) {
      const categoriaNombre = est.categoria?.nombre || '';
      const texto = `${est.nombre} ${est.descripcion || ''} ${categoriaNombre}`.trim();
      
      const embeddingResult = await embedder(texto);
      const embedding = Array.from(embeddingResult[0][0]); // ← CONVERTIR A ARRAY
      
      await Establecimiento.findByIdAndUpdate(est._id, { embedding });
      procesados++;
      console.log(`✅ ${procesados}/${sinEmbedding.length} - Embedding generado para: ${est.nombre}`);
    }

    console.log("🎉 Todos los embeddings generados");
    return res.json({
      mensaje: "Embeddings generados exitosamente",
      procesados: procesados
    });
  } catch (err) {
    console.error("❌ Error generando embeddings:", err);
    return res.status(500).json({ error: "Error al generar embeddings" });
  }
};