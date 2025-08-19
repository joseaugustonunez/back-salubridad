// src/controllers/ubicacionController.js
import Ubicacion from '../models/ubicacionModel.js'; // Importamos el modelo Ubicacion

// Obtener todas las ubicaciones
export const getUbicaciones = async (req, res) => {
  try {
    const ubicaciones = await Ubicacion.find();
    res.status(200).json(ubicaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener las ubicaciones' });
  }
};

// Obtener una ubicación por ID
export const getUbicacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const ubicacion = await Ubicacion.findById(id);
    if (!ubicacion) {
      return res.status(404).json({ message: 'Ubicación no encontrada' });
    }
    res.status(200).json(ubicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener la ubicación' });
  }
};

// Crear una nueva ubicación
export const createUbicacion = async (req, res) => {
  try {
    const { direccion, ciudad, distrito, codigoPostal, coordenadas, referencia } = req.body;
    const newUbicacion = new Ubicacion({ direccion, ciudad, distrito, codigoPostal, coordenadas, referencia });
    await newUbicacion.save();
    res.status(201).json(newUbicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al crear la ubicación' });
  }
};

// Actualizar una ubicación existente
export const updateUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { direccion, ciudad, distrito, codigoPostal, coordenadas, referencia } = req.body;
    const ubicacion = await Ubicacion.findById(id);
    if (!ubicacion) {
      return res.status(404).json({ message: 'Ubicación no encontrada' });
    }
    if (direccion) ubicacion.direccion = direccion;
    if (ciudad) ubicacion.ciudad = ciudad;
    if (distrito) ubicacion.distrito = distrito;
    if (codigoPostal) ubicacion.codigoPostal = codigoPostal;
    if (coordenadas) ubicacion.coordenadas = coordenadas;
    if (referencia) ubicacion.referencia = referencia;
    await ubicacion.save();
    res.status(200).json(ubicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al actualizar la ubicación' });
  }
};

// Eliminar una ubicación
export const deleteUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const ubicacion = await Ubicacion.findById(id);
    if (!ubicacion) {
      return res.status(404).json({ message: 'Ubicación no encontrada' });
    }
    await ubicacion.deleteOne();
    res.status(200).json({ message: 'Ubicación eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al eliminar la ubicación' });
  }
};
