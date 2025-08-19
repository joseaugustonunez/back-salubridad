import mongoose from 'mongoose';

const comentarioSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Relación con el usuario que deja el comentario
  establecimiento: { type: mongoose.Schema.Types.ObjectId, ref: 'Establecimiento', required: true }, // Relación con el establecimiento
  comentario: { type: String, required: true }, // El texto del comentario
  calificacion: { type: Number, min: 1, max: 5 }, // Calificación en estrellas (1 a 5)
  fecha: { type: Date, default: Date.now } // Fecha en la que se dejó el comentario
});

const Comentario = mongoose.model('Comentario', comentarioSchema);

export default Comentario;
