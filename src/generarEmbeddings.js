import mongoose from "mongoose";
import Establecimiento from "./models/establecimientoModel.js";
import Categoria from "./models/categoriaModel.js";
import Tipo from "./models/tipoModel.js";
import 'dotenv/config';
import { pipeline } from "@xenova/transformers";

(async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("❌ La variable de entorno MONGO_URI no está definida");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Buscar establecimientos sin embedding (populate incluido)
    const establecimientos = await Establecimiento.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: [] },
        { embedding: null }
      ]
    })
      .populate("categoria", "nombre")
      .populate("tipo", "nombre");

    if (!establecimientos.length) {
      console.log("✅ Todos los establecimientos ya tienen embeddings.");
      const total = await Establecimiento.countDocuments({});
      console.log(`📊 Total de establecimientos en BD: ${total}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`🔄 Procesando ${establecimientos.length} establecimientos...`);

    // Cargar modelo de embeddings local
    console.log("📦 Cargando modelo de embeddings...");
    const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("✅ Modelo cargado");

    let procesados = 0;

    for (const e of establecimientos) {
      // ✅ Manejo robusto de categorías
      const categoriasText = Array.isArray(e.categoria)
        ? e.categoria.map(c => c.nombre).join(" ")
        : e.categoria?.nombre || "";

      // ✅ Manejo robusto de tipos
      const tiposText = Array.isArray(e.tipo)
        ? e.tipo.map(t => t.nombre).join(" ")
        : e.tipo?.nombre || "";

      // ✅ Construir texto completo para el embedding
      const text = `${e.nombre} ${e.descripcion || ""} ${categoriasText} ${tiposText}`.trim();

      console.log(`📝 Procesando: ${e.nombre}`);
      console.log(`   📂 Categorías: ${categoriasText || "ninguna"}`);
      console.log(`   🏷️ Tipos: ${tiposText || "ninguno"}`);
      console.log(`   📄 Texto completo: "${text}"`);

      // ✅ Generar embedding
      const embeddingResult = await embedder(text);
      const embeddingArray = Array.from(embeddingResult[0][0]);

      // ✅ Guardar embedding
      await Establecimiento.updateOne(
        { _id: e._id },
        { $set: { embedding: embeddingArray } }
      );

      procesados++;
      console.log(`✅ [${procesados}/${establecimientos.length}] Embedding guardado para: ${e.nombre}\n`);
    }

    console.log(`\n🎉 Proceso completado exitosamente`);
    console.log(`📊 Establecimientos procesados: ${procesados}`);

    // Verificación final
    const conEmbedding = await Establecimiento.countDocuments({
      embedding: { $exists: true, $ne: [], $ne: null }
    });
    console.log(`✅ Establecimientos con embedding en BD: ${conEmbedding}`);

    await mongoose.disconnect();
    console.log("👋 Desconectado de MongoDB");
    process.exit(0);

  } catch (err) {
    console.error("❌ Error generando embeddings:", err);
    console.error(err.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
