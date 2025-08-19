// src/controllers/notificacionController.js
import Notificacion from '../models/notificacionModel.js'; // Importamos el modelo Notificacion

// Obtener todas las notificaciones de un usuario
export const getNotificaciones = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const notificaciones = await Notificacion.find({ usuario: usuarioId })
      .sort({ fecha: -1 }); // Ordenar por fecha descendente (últimas notificaciones primero)
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener las notificaciones' });
  }
};

// Marcar una notificación como leída
export const marcarNotificacionLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await Notificacion.findById(id);
    if (!notificacion) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    notificacion.leida = true;
    await notificacion.save();
    res.status(200).json(notificacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al marcar la notificación como leída' });
  }
};

// Crear una nueva notificación
export const createNotificacion = async (req, res) => {
  try {
    const { usuario, mensaje, tipo } = req.body;
    const newNotificacion = new Notificacion({ usuario, mensaje, tipo });
    await newNotificacion.save();
    res.status(201).json(newNotificacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al crear la notificación' });
  }
};

// Eliminar una notificación
export const deleteNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await Notificacion.findById(id);
    if (!notificacion) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    await notificacion.deleteOne();
    res.status(200).json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al eliminar la notificación' });
  }
};
