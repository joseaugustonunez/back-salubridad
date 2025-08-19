// src/models/promocionModel.js
import mongoose from 'mongoose';

const promocionSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  condiciones: { type: String },
  estado: { type: String, enum: ['activa', 'inactiva', 'expirada'], default: 'activa' },
  descuento: { type: Number, required: true, min: 0, max: 100 }, // Porcentaje de descuento
  imagen: { type: String }, // URL de la imagen de la promoción
  establecimiento: { type: mongoose.Schema.Types.ObjectId, ref: 'Establecimiento', required: true } // Relación con establecimiento
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

const Promocion = mongoose.model('Promocion', promocionSchema);

export default Promocion;
