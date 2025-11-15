// src/controllers/comentarioController.js
import Comentario from '../models/comentarioModel.js'; // Importamos el modelo Comentario
import User from '../models/userModel.js';
import Establecimiento from '../models/establecimientoModel.js';
// Obtener todos los comentarios
export const getComentarios = async (req, res) => {
  try {
    const comentarios = await Comentario.find()
      .populate('usuario') // Rellenamos la referencia al usuario
      .populate('establecimiento'); // Rellenamos la referencia al establecimiento
    res.status(200).json(comentarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener los comentarios' });
  }
};

// Obtener comentarios por establecimiento
export const getComentariosByEstablecimiento = async (req, res) => {
  try {
    const { establecimientoId } = req.params; // Obtiene el ID del establecimiento desde los parámetros de la URL
    const comentarios = await Comentario.find({ establecimiento: establecimientoId })
      .populate('usuario') // Rellena la referencia al usuario
      .populate('establecimiento'); // Rellena la referencia al establecimiento
    res.status(200).json(comentarios); // Devuelve los comentarios en formato JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener los comentarios del establecimiento' });
  }
};

// Crear un nuevo comentario
export const crearComentario = async (req, res) => {
  try {
    const { usuario, establecimiento, comentario, calificacion } = req.body;

    // Crear el comentario
    const nuevoComentario = new Comentario({
      usuario,
      establecimiento,
      comentario,
      calificacion,
    });

    const comentarioGuardado = await nuevoComentario.save();

    // Popular el usuario en el comentario guardado
    const comentarioPopulado = await comentarioGuardado.populate({
      path: 'usuario',
      select: 'nombreUsuario', // Solo incluir el campo `nombreUsuario`
    });

    // Agregar el comentario al establecimiento
    await Establecimiento.findByIdAndUpdate(
      establecimiento,
      { $push: { comentarios: comentarioGuardado._id } },
      { new: true }
    );

    res.status(201).json(comentarioPopulado); // Devolver el comentario con el usuario populado
  } catch (error) {
    console.error("Error al crear comentario:", error);
    res.status(500).json({ message: "Error al crear el comentario" });
  }
};
// Eliminar un comentario
export const deleteComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const comentario = await Comentario.findById(id);
    if (!comentario) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }
    await comentario.deleteOne();
    res.status(200).json({ message: 'Comentario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al eliminar el comentario' });
  }
};

// Obtener comentarios por usuario
export const getComentariosByUsuario = async (req, res) => {
  try {
    const paramId = req.params.userId;
    const userId = paramId || (req.user && (req.user._id || req.user.id));

    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario no proporcionado' });
    }

    const [comentarios, total] = await Promise.all([
      Comentario.find({ usuario: userId })
        .populate('usuario', 'nombreUsuario _id')
        .populate('establecimiento', 'nombre _id'),
      Comentario.countDocuments({ usuario: userId }),
    ]);

    res.status(200).json({ total, comentarios });
  } catch (error) {
    console.error('Error al obtener comentarios por usuario:', error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener los comentarios del usuario' });
  }
};
