import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombreUsuario: { type: String, required: true, unique: true },
  fotoPerfil: { type: String },
  fotoPortada: { type: String },
  establecimientosLikes: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Establecimiento' }
  ],
  establecimientosCreados: [ // 👈 nuevo campo opcional
    { type: mongoose.Schema.Types.ObjectId, ref: 'Establecimiento' }
  ],
  bio: { type: String },
  fechaCreacion: { type: Date, default: Date.now },
  rol: { 
    type: String, 
    enum: ['usuario', 'administrador', 'vendedor'],
    default: 'usuario',
    required: true 
  },
  recoveryToken: { type: String },
recoveryTokenExpires: { type: Date }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
