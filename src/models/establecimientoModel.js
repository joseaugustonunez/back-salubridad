import mongoose from 'mongoose';

const establecimientoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 👈 nuevo campo
  ubicacion: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ubicacion' }],
  categoria: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }],
  tipo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tipo' }],
  horario: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Horario' }],
  telefono: { type: String },
  imagen: { type: String },
  portada: { type: String },
  imagenes: [{ type: String }],
  estado: { 
    type: String, 
    enum: ['pendiente', 'aprobado', 'rechazado'], 
    default: 'pendiente' 
  },
  verificado: { type: Boolean, default: false },
  fechaCreacion: { type: Date, default: Date.now },
  fechaVerificacion: { type: Date },
  comentarios: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comentario', // Asegúrate de que este sea el nombre del modelo de comentarios
    },
  ],
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  seguidores: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  redesSociales: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    tiktok: { type: String },
  }
}, { timestamps: true });

const Establecimiento = mongoose.model('Establecimiento', establecimientoSchema);

export default Establecimiento;
