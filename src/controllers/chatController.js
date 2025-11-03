import { pipeline } from "@xenova/transformers";
import Establecimiento from "../models/establecimientoModel.js";
import Categoria from "../models/categoriaModel.js";
import Tipo from "../models/tipoModel.js";

function cosineSimilarity(a, b) {
  const arrayA = Array.isArray(a) ? a : Array.from(Object.values(a));
  const arrayB = Array.isArray(b) ? b : Array.from(Object.values(b));
  
  const dot = arrayA.reduce((sum, v, i) => sum + v * arrayB[i], 0);
  const normA = Math.sqrt(arrayA.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(arrayB.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}

function formatearEstablecimiento(est) {
  const categorias = est.categoria?.map(c => c.nombre).join(", ") || "Sin categoría";
  const tipos = est.tipo?.map(t => t.nombre).join(", ") || "Sin tipo";
  const direccion = est.ubicacion?.[0]?.direccion || "Dirección no disponible";
  const telefono = est.telefono || "No disponible";
  const imagen = est.imagen || est.portada || (est.imagenes?.[0]) || null;
  
  let horarioTexto = "No especificado";
  if (est.horario && est.horario.length > 0) {
    const h = est.horario[0];
    horarioTexto = `${h.apertura || ''} - ${h.cierre || ''}`;
  }

  const redes = [];
  if (est.redesSociales) {
    if (est.redesSociales.facebook) redes.push(`Facebook: ${est.redesSociales.facebook}`);
    if (est.redesSociales.instagram) redes.push(`Instagram: ${est.redesSociales.instagram}`);
    if (est.redesSociales.tiktok) redes.push(`TikTok: ${est.redesSociales.tiktok}`);
  }

  return {
    id: est._id,
    nombre: est.nombre,
    descripcion: est.descripcion || "Sin descripción",
    categorias,
    tipos,
    direccion,
    telefono,
    horario: horarioTexto,
    imagen,
    imagenes: est.imagenes || [],
    redesSociales: redes,
    likes: est.likes?.length || 0,
    comentarios: est.comentarios?.length || 0,
    verificado: est.verificado || false,
    score: est.score || 0
  };
}

function generarRespuesta(establecimientos) {
  if (!establecimientos.length) {
    return "😕 No encontré establecimientos relacionados con tu búsqueda.";
  }

  const principal = establecimientos[0];
  let respuesta = `✨ **${principal.nombre}**\n`;
  respuesta += `📍 ${principal.direccion}\n`;
  respuesta += `🏷️ ${principal.categorias}\n`;
  
  if (principal.tipos !== "Sin tipo") {
    respuesta += `📂 Tipo: ${principal.tipos}\n`;
  }
  
  if (principal.telefono !== "No disponible") {
    respuesta += `📞 ${principal.telefono}\n`;
  }
  
  if (principal.horario !== "No especificado") {
    respuesta += `🕒 ${principal.horario}\n`;
  }

  if (principal.descripcion !== "Sin descripción") {
    respuesta += `\n${principal.descripcion}\n`;
  }

  if (establecimientos.length > 1) {
    respuesta += `\n\n**Otros lugares similares:**\n`;
    establecimientos.slice(1, Math.min(6, establecimientos.length)).forEach((e, i) => {
      respuesta += `${i + 2}. ${e.nombre} - ${e.categorias} (${e.direccion})\n`;
    });
  }

  return respuesta;
}

// Función auxiliar para detectar categorías/tipos en el mensaje
async function detectarFiltros(mensaje) {
  const mensajeLower = mensaje.toLowerCase();
  
  // Buscar categorías que coincidan
  const categorias = await Categoria.find({
    nombre: { $regex: mensajeLower, $options: "i" }
  }).lean();
  
  // Buscar tipos que coincidan
  const tipos = await Tipo.find({
    nombre: { $regex: mensajeLower, $options: "i" }
  }).lean();
  
  return {
    categorias: categorias.map(c => c._id),
    tipos: tipos.map(t => t._id)
  };
}

// Función para aplicar filtros post-búsqueda
function aplicarFiltrosInteligentes(establecimientos, mensaje) {
  const mensajeLower = mensaje.toLowerCase();
  
  // Palabras clave comunes
  const palabrasClave = {
    comida: ['comida', 'comer', 'almorzar', 'cenar', 'hambre', 'plato'],
    postre: ['postre', 'dulce', 'helado', 'pastel', 'torta'],
    bebida: ['beber', 'tomar', 'jugo', 'café', 'té'],
    entretenimiento: ['diversión', 'entretenimiento', 'jugar', 'divertir']
  };
  
  // Detectar contexto
  let contexto = null;
  for (const [tipo, palabras] of Object.entries(palabrasClave)) {
    if (palabras.some(p => mensajeLower.includes(p))) {
      contexto = tipo;
      break;
    }
  }
  
  // Si hay contexto, priorizar establecimientos relacionados
  if (contexto) {
    return establecimientos.sort((a, b) => {
      const aRelevante = a.categorias.toLowerCase().includes(contexto) || 
                         a.tipos.toLowerCase().includes(contexto);
      const bRelevante = b.categorias.toLowerCase().includes(contexto) || 
                         b.tipos.toLowerCase().includes(contexto);
      
      if (aRelevante && !bRelevante) return -1;
      if (!aRelevante && bRelevante) return 1;
      return b.score - a.score;
    });
  }
  
  return establecimientos;
}

const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

export const procesarMensaje = async (req, res) => {
  try {
    const message = (req.body?.message || req.body?.mensaje || "").trim();
    console.log("📩 Mensaje recibido:", message);
    
    if (!message) {
      return res.status(400).json({ error: "Mensaje vacío" });
    }

    // Detectar filtros de categoría/tipo en el mensaje
    const filtros = await detectarFiltros(message);
    console.log("🔍 Filtros detectados:", filtros);

    const embeddingResult = await embedder(message);
    const queryEmbedding = Array.from(embeddingResult[0][0]);

    // Construir query con filtros opcionales
    let query = {
      embedding: { $exists: true, $ne: [], $ne: null }
    };
    
    if (filtros.categorias.length > 0) {
      query.categoria = { $in: filtros.categorias };
    }
    
    if (filtros.tipos.length > 0) {
      query.tipo = { $in: filtros.tipos };
    }

    let all = await Establecimiento.find(query)
      .populate("categoria", "nombre")
      .populate("tipo", "nombre")
      .populate("ubicacion", "nombre direccion latitud longitud")
      .populate("horario", "apertura cierre diasSemana")
      .populate("comentarios", "texto valoracion usuario")
      .lean();

    console.log("📊 Establecimientos con embedding encontrados:", all.length);

    // Fallback: si no hay resultados con filtros, buscar sin ellos
    if (all.length === 0 && (filtros.categorias.length > 0 || filtros.tipos.length > 0)) {
      console.log("⚠️ Sin resultados con filtros, buscando sin filtros...");
      all = await Establecimiento.find({
        embedding: { $exists: true, $ne: [], $ne: null }
      })
        .populate("categoria", "nombre")
        .populate("tipo", "nombre")
        .populate("ubicacion", "nombre direccion latitud longitud")
        .populate("horario", "apertura cierre diasSemana")
        .populate("comentarios", "texto valoracion usuario")
        .lean();
    }

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
        .populate("ubicacion", "nombre direccion latitud longitud")
        .populate("horario", "apertura cierre diasSemana")
        .populate("comentarios", "texto valoracion usuario")
        .lean();

      console.log("📊 Establecimientos encontrados por texto:", all.length);

      if (all.length) {
        const formateados = all.slice(0, 10).map(formatearEstablecimiento);
        const respuesta = generarRespuesta(formateados);
        
        return res.json({
          respuesta,
          found: all.length,
          results: formateados,
          metodo: "busqueda_texto"
        });
      }

      return res.json({
        respuesta: "😕 No encontré establecimientos relacionados con tu búsqueda.",
        found: 0,
        results: [],
      });
    }

    // Calcular similitud
    const scored = all.map((e) => ({
      ...e,
      score: cosineSimilarity(queryEmbedding, e.embedding),
    }));

    // Ordenar por score y tomar top 20 para luego filtrar
    let resultados = scored.sort((a, b) => b.score - a.score).slice(0, 20);

    console.log("🎯 Mejor score:", resultados[0]?.score);
    console.log("🏆 Top 5:", resultados.slice(0, 5).map(r => `${r.nombre} (${r.score.toFixed(3)})`));

    // Formatear primero
    let formateados = resultados.map(formatearEstablecimiento);
    
    // Aplicar filtros inteligentes basados en contexto
    formateados = aplicarFiltrosInteligentes(formateados, message);
    
    // Aumentar el umbral para mejor calidad
    const umbralAlto = 0.5;  // Mayor similitud requerida
    const umbralMedio = 0.35; // Similitud media
    
    let respuesta;
    
    if (resultados.length && resultados[0].score > umbralAlto) {
      // Alta confianza
      formateados = formateados.slice(0, 6);
      respuesta = generarRespuesta(formateados);
    } else if (resultados.length && resultados[0].score > umbralMedio) {
      // Confianza media
      formateados = formateados.slice(0, 8);
      respuesta = "🤔 Encontré estos lugares que podrían interesarte:\n\n";
      respuesta += generarRespuesta(formateados);
    } else {
      // Baja confianza - mostrar más opciones
      formateados = formateados.slice(0, 10);
      respuesta = "💡 Aquí hay algunas sugerencias basadas en tu búsqueda:\n\n";
      respuesta += generarRespuesta(formateados);
    }

    return res.json({
      respuesta,
      found: formateados.length,
      results: formateados,
      metodo: "similitud_semantica",
      scoreMaximo: resultados[0]?.score || 0
    });
  } catch (err) {
    console.error("❌ Error procesarMensaje:", err);
    return res.status(500).json({ 
      error: "Error al procesar el mensaje",
      detalle: err.message 
    });
  }
};

export const generarEmbeddings = async (req, res) => {
  try {
    const sinEmbedding = await Establecimiento.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: [] },
        { embedding: null }
      ]
    }).populate("categoria", "nombre")
      .populate("tipo", "nombre");

    console.log(`🔄 Procesando ${sinEmbedding.length} establecimientos sin embedding...`);

    if (sinEmbedding.length === 0) {
      return res.json({
        mensaje: "Todos los establecimientos ya tienen embeddings",
        procesados: 0
      });
    }

    let procesados = 0;
    for (const est of sinEmbedding) {
      const categoriaNombre = est.categoria?.map(c => c.nombre).join(" ") || '';
      const tipoNombre = est.tipo?.map(t => t.nombre).join(" ") || '';
      
      // Texto más rico para embeddings
      const texto = `${est.nombre} ${est.descripcion || ''} ${categoriaNombre} ${tipoNombre} establecimiento comida restaurante`.trim();
      
      const embeddingResult = await embedder(texto);
      const embedding = Array.from(embeddingResult[0][0]);
      
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