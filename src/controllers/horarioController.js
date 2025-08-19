// src/controllers/horarioController.js
import Horario from '../models/horarioModel.js'; // Importamos el modelo Horario

// Obtener todos los horarios
export const getHorarios = async (req, res) => {
  try {
    const horarios = await Horario.find();
    res.status(200).json(horarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener los horarios' });
  }
};

// Obtener un horario por ID
export const getHorarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const horario = await Horario.findById(id);
    if (!horario) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }
    res.status(200).json(horario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener el horario' });
  }
};

// Crear un nuevo horario
export const createHorario = async (req, res) => {
  try {
    const { dia, entrada, salida } = req.body;
    const newHorario = new Horario({ dia, entrada, salida });
    await newHorario.save();
    res.status(201).json(newHorario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al crear el horario' });
  }
};

// Actualizar un horario existente
export const updateHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { dia, entrada, salida } = req.body;
    const horario = await Horario.findById(id);
    if (!horario) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }
    if (dia) horario.dia = dia;
    if (entrada) horario.entrada = entrada;
    if (salida) horario.salida = salida;
    await horario.save();
    res.status(200).json(horario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al actualizar el horario' });
  }
};

// Eliminar un horario
export const deleteHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const horario = await Horario.findById(id);
    if (!horario) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }
    await horario.deleteOne();
    res.status(200).json({ message: 'Horario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al eliminar el horario' });
  }
};
