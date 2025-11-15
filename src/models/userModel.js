import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Nuevos campos: nombres y apellidos (sevalidan en el controlador de register)
    nombres: { type: String }, 
    apellidos: { type: String },

    nombreUsuario: { type: String, required: true, unique: true },
    fotoPerfil: { type: String },
    fotoPortada: { type: String },

    // Establecimientos que el usuario dio like
    establecimientosLikes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Establecimiento" },
    ],

    // Establecimientos creados por el usuario
    establecimientosCreados: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Establecimiento" },
    ],

    // 👇 Nuevo campo: establecimientos que el usuario sigue
    establecimientosSeguidos: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Establecimiento" },
    ],

    bio: { type: String },
    fechaCreacion: { type: Date, default: Date.now },
    solicitudVendedor: {
      type: String,
      enum: ["pendiente", "aprobada", "rechazada", null],
      default: null,
    },

    rol: {
      type: String,
      enum: ["usuario", "administrador", "vendedor"],
      default: "usuario",
      required: true,
    },
    recoveryToken: { type: String },
    recoveryTokenExpires: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
