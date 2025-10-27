import mongoose from "mongoose";
import Establecimiento from "./models/establecimientoModel.js";
import 'dotenv/config';
import { pipeline } from "@xenova/transformers";

(async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("❌ La variable de entorno MONGO_URI no está definida");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Buscar establecimientos sin embedding (SIN populate)
    const establecimientos = await Establecimiento.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: [] },
        { embedding: null }
      ]
    });

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
      // Construir texto descriptivo (sin categoría ya que no la populamos)
      const text = `${e.nombre} ${e.descripcion || ""}`.trim();

      console.log(`📝 Procesando: ${e.nombre}`);
      
      // Generar embedding
      const embeddingResult = await embedder(text);
      
      // Extraer correctamente el vector
      const embeddingArray = Array.from(embeddingResult[0][0]);
      
      // Guardar el embedding
      e.embedding = embeddingArray;
      await e.save();
      
      procesados++;
      console.log(`✅ [${procesados}/${establecimientos.length}] Embedding guardado para: ${e.nombre} (dim: ${embeddingArray.length})`);
    }

    console.log(`\n🎉 Proceso completado exitosamente`);
    console.log(`📊 Establecimientos procesados: ${procesados}`);
    
    // Verificar que se guardaron correctamente
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