
import fetch from "node-fetch";
import Establecimiento from "./models/establecimientoModel.js";
export const procesarMensaje = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message)
      return res.status(400).json({ error: "Mensaje vacío" });

    // 1️⃣ Buscar en la base de datos
    const establecimientos = await Establecimiento.find({
      nombre: { $regex: message, $options: "i" },
    });

    let respuestaBase = "No encontré lugares con ese nombre.";
    if (establecimientos.length > 0) {
      const nombres = establecimientos.map((e) => e.nombre).join(", ");
      respuestaBase = `Encontré estos lugares que podrían interesarte: ${nombres}`;
    }

    // 2️⃣ (Opcional) Pasar la respuesta por Hugging Face para que suene natural
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `Reformula esta respuesta de manera amable: ${respuestaBase}`,
        }),
      }
    );

    const data = await hfResponse.json();
    const textoFinal = data?.[0]?.generated_text || respuestaBase;

    res.json({ response: textoFinal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar el mensaje" });
  }
};
