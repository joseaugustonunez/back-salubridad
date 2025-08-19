// src/models/categoriaModel.js
import mongoose from 'mongoose';

const categoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true }, // Nombre de la categoría
  descripcion: { type: String }, // Descripción opcional
  fechaCreacion: { type: Date, default: Date.now } // Fecha de creación
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

const Categoria = mongoose.model('Categoria', categoriaSchema);

export default Categoria;
