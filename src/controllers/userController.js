import User from '../models/userModel.js';
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
