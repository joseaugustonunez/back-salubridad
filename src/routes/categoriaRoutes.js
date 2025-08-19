// src/routes/categoriaRoutes.js
import express from 'express';
import { getCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria } from '../controllers/categoriaController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

router.get('/', getCategorias); // Obtener todas las categorías
router.get('/:id', getCategoriaById); // Obtener una categoría por su ID
router.post('/', createCategoria); // Crear una nueva categoría
router.patch('/:id', updateCategoria); // Actualizar una categoría
router.delete('/:id', deleteCategoria); // Eliminar una categoría


// Rutas para gestionar las categorías
/* router.get('/', authenticateToken, getCategorias); // Obtener todas las categorías
router.get('/:id', authenticateToken, getCategoriaById); // Obtener una categoría por su ID
router.post('/', authenticateToken, createCategoria); // Crear una nueva categoría
router.patch('/:id', authenticateToken, updateCategoria); // Actualizar una categoría
router.delete('/:id', authenticateToken, deleteCategoria); // Eliminar una categoría
 */
export default router;
