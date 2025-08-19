// src/routes/tipoRoutes.js
import express from 'express';
import { getTipos, getTipoById, createTipo, updateTipo, deleteTipo } from '../controllers/tipoController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

router.get('/', getTipos); // Obtener todos los tipos
router.get('/:id', getTipoById); // Obtener un tipo por su ID
router.post('/', createTipo); // Crear un nuevo tipo
router.patch('/:id', updateTipo); // Actualizar un tipo por su ID
router.delete('/:id', deleteTipo); // Eliminar un tipo por su ID
// Rutas para gestionar los tipos
/* router.get('/', authenticateToken, getTipos); // Obtener todos los tipos
router.get('/:id', authenticateToken, getTipoById); // Obtener un tipo por su ID
router.post('/', authenticateToken, createTipo); // Crear un nuevo tipo
router.patch('/:id', authenticateToken, updateTipo); // Actualizar un tipo por su ID
router.delete('/:id', authenticateToken, deleteTipo); // Eliminar un tipo por su ID */

export default router;
