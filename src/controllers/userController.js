import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Establecimiento from '../models/establecimientoModel.js';
import Comentario from '../models/comentarioModel.js';
import Promocion from '../models/promocionModel.js';
import bcrypt from 'bcrypt';


export const getUsers = async (req, res) => {
  try {
    // Obtener todos los usuarios de la base de datos
    const users = await User.find();

    // Enviar una respuesta al cliente
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener los usuarios' });
  }
};
export const uploadProfilePicture = async (req, res) => {
  try {
    const { id } = req.params; // ID del usuario
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ninguna imagen" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar la foto de perfil
    user.fotoPerfil = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({ fotoPerfil: user.fotoPerfil });
  } catch (error) {
    console.error("Error al subir la foto de perfil:", error);
    res.status(500).json({ message: "Error al subir la foto de perfil" });
  }
};
export const uploadCoverPhoto = async (req, res) => {
  try {
    const { id } = req.params; // ID del usuario
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ninguna imagen" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar la foto de portada
    user.fotoPortada = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({ fotoPortada: user.fotoPortada });
  } catch (error) {
    console.error("Error al subir la foto de portada:", error);
    res.status(500).json({ message: "Error al subir la foto de portada" });
  }
};
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar un usuario por su ID en la base de datos
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Enviar una respuesta al cliente
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener el usuario' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

    // Buscar un usuario por su ID en la base de datos
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar el correo electrónico y la contraseña del usuario
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();

    // Enviar una respuesta al cliente
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al actualizar el usuario' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar un usuario por su ID en la base de datos
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar el usuario de la base de datos
    await user.remove();

    // Enviar una respuesta al cliente
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al eliminar el usuario' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body; // 👈 en español

    const allowedRoles = ["usuario", "administrador", "vendedor"];
    if (!rol || !allowedRoles.includes(rol)) {
      return res.status(400).json({
        message: "Rol inválido. Valores permitidos: usuario, administrador, vendedor",
      });
    }

    // verificar que el que hace la petición sea administrador
    if (!req.user || req.user.rol !== "administrador") {
      return res.status(403).json({ message: "Acceso denegado. Se requiere rol administrador." });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.rol = rol;
    await user.save();

    res.status(200).json({ message: "Rol actualizado correctamente", user });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ message: "Error al actualizar el rol del usuario" });
  }
};
export const getEstablecimientosSeguidos = async (req, res) => {
  try {
    // Si estás usando autenticación JWT, puedes obtener el ID del usuario autenticado:
    const userId = req.user?.id || req.params.id;

    // Buscar al usuario y popular los establecimientos seguidos
    const user = await User.findById(userId)
      .populate({
        path: 'establecimientosSeguidos',
        select: 'nombre descripcion imagen portada verificado categoria tipo ubicacion', // campos del establecimiento
        populate: [
          { path: 'categoria', select: 'nombre' },
          { path: 'tipo', select: 'nombre' },
          { path: 'ubicacion', select: 'direccion ciudad' },
        ],
      });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      total: user.establecimientosSeguidos.length,
      establecimientosSeguidos: user.establecimientosSeguidos,
    });
  } catch (error) {
    console.error('Error al obtener establecimientos seguidos:', error);
    res.status(500).json({
      message: 'Ha ocurrido un error al obtener los establecimientos seguidos',
    });
  }
};
// Obtener todos los comentarios de los establecimientos que sigue el usuario
export const getComentariosDeSeguidos = async (req, res) => {
  try {
    const userId = req.params.id || req.user?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const user = await User.findById(userId).select('establecimientosSeguidos').lean();
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const followedIds = user.establecimientosSeguidos || [];

    // Si existe modelo Comentario, consultar directamente
    if (Comentario) {
      const comentarios = await Comentario.find({ establecimiento: { $in: followedIds } })
        .populate('usuario', 'nombreUsuario fotoPerfil')
        .populate('establecimiento', 'nombre imagen portada')
        .sort({ fecha: -1 })
        .lean();

      return res.status(200).json({ comentarios });
    }

    // Fallback: sacar comentarios embebidos desde Establecimiento
    const establecimientos = await Establecimiento.find({ _id: { $in: followedIds } })
      .populate({
        path: 'comentarios',
        populate: { path: 'usuario', select: 'nombreUsuario fotoPerfil' },
      })
      .lean();

    const comentariosAgregados = [];
    establecimientos.forEach((est) => {
      if (Array.isArray(est.comentarios)) {
        est.comentarios.forEach((c) => {
          comentariosAgregados.push({
            ...c,
            establecimiento: { _id: est._id, nombre: est.nombre, imagen: est.imagen || est.portada },
          });
        });
      }
    });

    return res.status(200).json({ comentarios: comentariosAgregados });
  } catch (error) {
    console.error('Error en getComentariosDeSeguidos:', error);
    return res.status(500).json({ message: 'Error al obtener comentarios de seguidos', detalles: error.message });
  }
};

// Obtener promociones de los establecimientos que sigue el usuario
export const getPromocionesDeSeguidos = async (req, res) => {
  try {
    const userId = req.params.id || req.user?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const user = await User.findById(userId).select('establecimientosSeguidos').lean();
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const followedIds = user.establecimientosSeguidos || [];

    // Intentar usar un modelo Promocion si existe
    let Promocion = null;
    try {
      // import dinámico para evitar fallo si el archivo no exporta nada
      // eslint-disable-next-line no-await-in-loop
      const mod = await import('../models/promocionModel.js');
      Promocion = mod.default || null;
    } catch (e) {
      Promocion = null;
    }

    if (Promocion) {
      const promociones = await Promocion.find({ establecimiento: { $in: followedIds } })
        .populate('establecimiento', 'nombre imagen portada')
        .sort({ fechaInicio: -1 })
        .lean();
      return res.status(200).json({ promociones });
    }

    // Fallback: buscar campo "promociones" dentro de Establecimiento
    const establecimientos = await Establecimiento.find({ _id: { $in: followedIds } }, 'nombre imagen promociones').lean();
    const promocionesAgregadas = [];
    establecimientos.forEach((est) => {
      if (Array.isArray(est.promociones)) {
        est.promociones.forEach((p) => {
          promocionesAgregadas.push({
            ...p,
            establecimiento: { _id: est._id, nombre: est.nombre, imagen: est.image || est.imagen },
          });
        });
      }
    });

    return res.status(200).json({ promociones: promocionesAgregadas });
  } catch (error) {
    console.error('Error en getPromocionesDeSeguidos:', error);
    return res.status(500).json({ message: 'Error al obtener promociones de seguidos', detalles: error.message });
  }
};
export const solicitarVendedor = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (user.solicitudVendedor === 'pendiente') {
      return res.status(400).json({ message: "Ya tienes una solicitud pendiente" });
    }

    if (user.rol === 'vendedor') {
      return res.status(400).json({ message: "Ya eres vendedor" });
    }

    user.solicitudVendedor = 'pendiente';
    await user.save();

    res.status(200).json({ message: "✅ Solicitud enviada correctamente" });
  } catch (error) {
    console.error("Error al solicitar vendedor:", error.message);
    res.status(500).json({ message: "Error al enviar solicitud" });
  }
};