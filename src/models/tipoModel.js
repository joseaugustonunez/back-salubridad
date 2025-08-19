// src/models/roleModel.js
import mongoose from 'mongoose';

const tipoSchema = new mongoose.Schema({
  tipo_nombre: { type: String, required: true, unique: true },
});

const Tipo = mongoose.model('Tipo', tipoSchema);

export default Tipo;
