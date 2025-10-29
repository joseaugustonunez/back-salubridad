import express from 'express';
import {
  getEstablecimientos,
  getEstablecimientoById,
  createEstablecimiento,
  updateEstablecimiento,
  deleteEstablecimiento,
  seguirEstablecimiento,
  dejarDeSeguirEstablecimiento,
  likeEstablecimiento,
  quitarLikeEstablecimiento,
  buscarEstablecimientoPorNombre,
  getEstablecimientoDelUsuario,
  cambiarEstado,
  cambiarVerificado,
  getEstablecimientosAprobados,
  eliminarImagen,
  agregarImagenes,
  actualizarImagenPrincipal,
  actualizarImagenPortada,
  reordenarImagenes
} from '../controllers/establecimientoController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// Subida de varias imágenes con campos distintos
const multipleUpload = upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'portada', maxCount: 1 },
  { name: 'imagenes', maxCount: 10 }
]);

// Rutas públicas
router.get('/', getEstablecimientos);
router.get('/aprobados', getEstablecimientosAprobados);
router.get('/buscar', buscarEstablecimientoPorNombre);
router.get('/:id', getEstablecimientoById);
router.get('/usuario/:usuarioId',authenticateToken, getEstablecimientoDelUsuario);
// Crear establecimiento (autenticado)
router.post('/', authenticateToken, multipleUpload, createEstablecimiento);
// Actualizar establecimiento (autenticado)
router.patch('/:id', authenticateToken, upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'imagenes', maxCount: 10 }
]), updateEstablecimiento);

// Eliminar establecimiento (autenticado)
router.delete('/:id', authenticateToken, deleteEstablecimiento);

// 🔁 Rutas para seguir / dejar de seguir un establecimiento
router.post('/:id/seguir', authenticateToken, seguirEstablecimiento);
router.post('/:id/dejar-de-seguir', authenticateToken, dejarDeSeguirEstablecimiento);
router.post('/:id/imagenes', authenticateToken, upload.array('imagenes'), agregarImagenes);

// Ruta para eliminar una imagen específica de un establecimiento
router.delete('/:id/imagenes', authenticateToken, eliminarImagen);

router.put('/:id/imagen-principal', authenticateToken, upload.single('imagen'), actualizarImagenPrincipal);

// ACTUALIZAR imagen de portada (solo si subes una nueva imagen)
router.put('/:id/imagen-portada', authenticateToken, upload.single('portada'), actualizarImagenPortada);

// Ruta para reordenar las imágenes de un establecimiento
router.put('/:id/reordenar-imagenes', authenticateToken, reordenarImagenes);
//  Rutas para dar / quitar like a un establecimiento
router.post('/:id/like', authenticateToken, likeEstablecimiento);
router.post('/:id/quitar-like', authenticateToken, quitarLikeEstablecimiento);
router.put('/:id/verificado', async (req, res) => {
  const { id } = req.params;
  const { verificado } = req.body;

  try {
    const establecimientoActualizado = await cambiarVerificado(id, verificado);
    res.json(establecimientoActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.put('/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const establecimientoActualizado = await cambiarEstado(id, estado);
    res.json(establecimientoActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


export default router;
