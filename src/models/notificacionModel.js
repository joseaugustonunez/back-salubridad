// src/models/notificacionModel.js
import mongoose from 'mongoose';

const notificacionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Relacionado con un usuario
  mensaje: { type: String, required: true }, // Contenido de la notificación
  tipo: { type: String, enum: ['promocion', 'sistema', 'comentario', 'like'], required: true }, // Tipo de notificación
  leida: { type: Boolean, default: false }, // Indica si la notificación fue leída
  fecha: { type: Date, default: Date.now } // Fecha de creación de la notificación
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

const Notificacion = mongoose.model('Notificacion', notificacionSchema);

export default Notificacion;
