// src/models/ubicacionModel.js
import mongoose from 'mongoose';

const ubicacionSchema = new mongoose.Schema({
  direccion: { type: String, required: true }, // Dirección exacta
  ciudad: { type: String, required: true }, // Ciudad
  distrito: { type: String, required: true }, // Distrito o zona
  codigoPostal: { type: String }, // Código postal (opcional)
  coordenadas: {
    latitud: { type: Number, required: true }, // Latitud en formato decimal
    longitud: { type: Number, required: true }, // Longitud en formato decimal
  },
  referencia: { type: String }, // Información adicional (ejemplo: "Cerca del parque central")
});

const Ubicacion = mongoose.model('Ubicacion', ubicacionSchema);

export default Ubicacion;
