// src/models/horarioModel.js
import mongoose from 'mongoose';

const horarioSchema = new mongoose.Schema({
  dia: { type: String, required: true }, // Ejemplo: "Lunes", "Martes", etc.
  entrada: { type: String, required: true }, // Formato "HH:mm", ejemplo: "08:00"
  salida: { type: String, required: true }, // Formato "HH:mm", ejemplo: "17:00"
});

const Horario = mongoose.model('Horario', horarioSchema);

export default Horario;
