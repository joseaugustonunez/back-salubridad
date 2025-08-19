// src/routes/horarioRoutes.js
import express from 'express';
import { getHorarios, getHorarioById, createHorario, updateHorario, deleteHorario } from '../controllers/horarioController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

router.get('/', getHorarios); // Obtener todos los horarios
router.get('/:id', getHorarioById); // Obtener un horario por su ID
router.post('/', createHorario); // Crear un nuevo horario
router.patch('/:id', updateHorario); // Actualizar un horario
router.delete('/:id', deleteHorario); // Eliminar un horario


/* // Rutas para gestionar los horarios
router.get('/', authenticateToken, getHorarios); // Obtener todos los horarios
router.get('/:id', authenticateToken, getHorarioById); // Obtener un horario por su ID
router.post('/', authenticateToken, createHorario); // Crear un nuevo horario
router.patch('/:id', authenticateToken, updateHorario); // Actualizar un horario
router.delete('/:id', authenticateToken, deleteHorario); // Eliminar un horario */

export default router;
