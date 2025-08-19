// src/controllers/tipoController.js
import Tipo from '../models/tipoModel.js'; // Importamos el modelo Tipo

// Obtener todos los tipos
export const getTipos = async (req, res) => {
  try {
    const tipos = await Tipo.find();
    res.status(200).json(tipos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener los tipos' });
  }
};

// Obtener un tipo por ID
export const getTipoById = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await Tipo.findById(id);
    if (!tipo) {
      return res.status(404).json({ message: 'Tipo no encontrado' });
    }
    res.status(200).json(tipo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener el tipo' });
  }
};

// Crear un nuevo tipo
export const createTipo = async (req, res) => {
  try {
    const { tipo_nombre } = req.body;
    const newTipo = new Tipo({ tipo_nombre });
    await newTipo.save();
    res.status(201).json(newTipo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al crear el tipo' });
  }
};

// Actualizar un tipo existente
export const updateTipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_nombre } = req.body;
    const tipo = await Tipo.findById(id);
    if (!tipo) {
      return res.status(404).json({ message: 'Tipo no encontrado' });
    }
    if (tipo_nombre) tipo.tipo_nombre = tipo_nombre;
    await tipo.save();
    res.status(200).json(tipo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al actualizar el tipo' });
  }
};

// Eliminar un tipo
export const deleteTipo = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await Tipo.findById(id);
    if (!tipo) {
      return res.status(404).json({ message: 'Tipo no encontrado' });
    }
    await tipo.deleteOne();
    res.status(200).json({ message: 'Tipo eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al eliminar el tipo' });
  }
};
