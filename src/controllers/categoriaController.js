// src/controllers/categoriaController.js
import Categoria from '../models/categoriaModel.js'; // Importamos el modelo Categoria

// Obtener todas las categorías
export const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.status(200).json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener las categorías' });
  }
};

// Obtener una categoría por ID
export const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener la categoría' });
  }
};

// Crear una nueva categoría
export const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const newCategoria = new Categoria({ nombre, descripcion });
    await newCategoria.save();
    res.status(201).json(newCategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al crear la categoría' });
  }
};

// Actualizar una categoría existente
export const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    if (nombre) categoria.nombre = nombre;
    if (descripcion) categoria.descripcion = descripcion;
    await categoria.save();
    res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al actualizar la categoría' });
  }
};

// Eliminar una categoría
export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    await categoria.deleteOne();
    res.status(200).json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al eliminar la categoría' });
  }
};
