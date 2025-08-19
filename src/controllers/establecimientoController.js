import Establecimiento from '../models/establecimientoModel.js';
import User from '../models/userModel.js'; 
import Ubicacion from '../models/ubicacionModel.js';
import Horario from '../models/horarioModel.js';
import Notificacion from '../models/notificacionModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta base del proyecto para operaciones con archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// Agregar imágenes a un establecimiento existente
export const agregarImagenes = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que se hayan subido imágenes
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se han subido imágenes' });
    }

    // Obtener nombres de archivo de las imágenes subidas
    const nuevasImagenes = req.files.map(file => file.filename);

    // Buscar el establecimiento
    const establecimiento = await Establecimiento.findById(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }

    // Verificar que el usuario sea el creador del establecimiento
    if (establecimiento.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este establecimiento' });
    }

    // Agregar las nuevas imágenes al array existente
    establecimiento.imagenes = [...establecimiento.imagenes, ...nuevasImagenes];
    await establecimiento.save();

    res.status(200).json({
      message: 'Imágenes agregadas correctamente',
      imagenes: establecimiento.imagenes
    });
  } catch (error) {
    console.error('Error al agregar imágenes:', error);
    res.status(500).json({ message: 'Error al agregar imágenes', detalles: error.message });
  }
};


// Eliminar una imagen específica de un establecimiento
export const eliminarImagen = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreImagen } = req.body;
    
    if (!nombreImagen) {
      return res.status(400).json({ message: 'Debe especificar el nombre de la imagen a eliminar' });
    }
    
    // Buscar el establecimiento
    const establecimiento = await Establecimiento.findById(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }
    
    // Verificar que el usuario sea el creador del establecimiento
    if (establecimiento.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este establecimiento' });
    }
    
    // Verificar que la imagen exista en el establecimiento
    if (!establecimiento.imagenes.includes(nombreImagen)) {
      return res.status(404).json({ message: 'La imagen no existe en este establecimiento' });
    }
    
    // Eliminar el archivo físico
    const rutaImagen = path.join(uploadsDir, nombreImagen);
    if (fs.existsSync(rutaImagen)) {
      fs.unlinkSync(rutaImagen);
    }
    
    // Eliminar referencia de la imagen en el establecimiento
    establecimiento.imagenes = establecimiento.imagenes.filter(img => img !== nombreImagen);
    await establecimiento.save();
    
    res.status(200).json({
      message: 'Imagen eliminada correctamente',
      imagenes: establecimiento.imagenes
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ message: 'Error al eliminar imagen', detalles: error.message });
  }
};

// Actualizar la imagen principal del establecimiento
export const actualizarImagenPrincipal = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Log the request details for debugging
    console.log('Actualizar Imagen Principal - Request:', {
      params: req.params,
      file: req.file,       // Changed from req.files to req.file for single upload
      body: req.body,
      auth: req.user?._id   // Check if auth user exists
    });
    
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido la imagen principal' });
    }
    
    const nuevaImagen = req.file.filename;  // Changed from req.files['imagen'][0].filename
    
    // Buscar el establecimiento
    const establecimiento = await Establecimiento.findById(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }
    
    // Verificar que el usuario sea el creador del establecimiento
    if (establecimiento.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este establecimiento' });
    }
    
    // Eliminar imagen principal anterior si existe
    if (establecimiento.imagen) {
      const rutaImagen = path.join(uploadsDir, establecimiento.imagen);
      if (fs.existsSync(rutaImagen)) {
        fs.unlinkSync(rutaImagen);
      }
    }
    
    // Actualizar imagen principal
    establecimiento.imagen = nuevaImagen;
    await establecimiento.save();
    
    res.status(200).json({
      message: 'Imagen principal actualizada correctamente',
      imagen: establecimiento.imagen
    });
  } catch (error) {
    console.error('Error al actualizar imagen principal:', error);
    res.status(500).json({ message: 'Error al actualizar imagen principal', detalles: error.message });
  }
};

// Actualizar la imagen de portada del establecimiento
export const actualizarImagenPortada = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Log the request details for debugging
    console.log('Actualizar Imagen Portada - Request:', {
      params: req.params,
      file: req.file,       // Changed from req.files to req.file
      body: req.body
    });
    
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido la imagen de portada' });
    }
    
    const nuevaPortada = req.file.filename;  // Changed from req.files['portada'][0].filename
    
    // Buscar el establecimiento
    const establecimiento = await Establecimiento.findById(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }
    
    // Verificar que el usuario sea el creador del establecimiento
    if (establecimiento.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este establecimiento' });
    }
    
    // Eliminar portada anterior si existe
    if (establecimiento.portada) {
      const rutaPortada = path.join(uploadsDir, establecimiento.portada);
      if (fs.existsSync(rutaPortada)) {
        fs.unlinkSync(rutaPortada);
      }
    }
    
    // Actualizar portada
    establecimiento.portada = nuevaPortada;
    await establecimiento.save();
    
    res.status(200).json({
      message: 'Imagen de portada actualizada correctamente',
      portada: establecimiento.portada
    });
  } catch (error) {
    console.error('Error al actualizar imagen de portada:', error);
    res.status(500).json({ message: 'Error al actualizar imagen de portada', detalles: error.message });
  }
};
// Reordenar las imágenes del establecimiento
export const reordenarImagenes = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaOrdenImagenes } = req.body;
    
    if (!nuevaOrdenImagenes || !Array.isArray(nuevaOrdenImagenes)) {
      return res.status(400).json({ message: 'Debe proporcionar un array con el nuevo orden de imágenes' });
    }
    
    // Buscar el establecimiento
    const establecimiento = await Establecimiento.findById(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }
    
    // Verificar que el usuario sea el creador del establecimiento
    if (establecimiento.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este establecimiento' });
    }
    
    // Verificar que el nuevo orden contenga las mismas imágenes (no más, no menos)
    const imagenesExistentes = new Set(establecimiento.imagenes);
    const nuevasImagenes = new Set(nuevaOrdenImagenes);
    
    if (imagenesExistentes.size !== nuevasImagenes.size) {
      return res.status(400).json({ 
        message: 'El nuevo orden debe contener exactamente las mismas imágenes que ya existen' 
      });
    }
    
    for (const img of nuevaOrdenImagenes) {
      if (!imagenesExistentes.has(img)) {
        return res.status(400).json({ 
          message: `La imagen ${img} no existe en este establecimiento` 
        });
      }
    }
    
    // Actualizar el orden de las imágenes
    establecimiento.imagenes = nuevaOrdenImagenes;
    await establecimiento.save();
    
    res.status(200).json({
      message: 'Orden de imágenes actualizado correctamente',
      imagenes: establecimiento.imagenes
    });
  } catch (error) {
    console.error('Error al reordenar imágenes:', error);
    res.status(500).json({ message: 'Error al reordenar imágenes', detalles: error.message });
  }
};

// Obtener todos los establecimientos
export const getEstablecimientos = async (req, res) => {
  try {
    const establecimientos = await Establecimiento.find()
      .populate("ubicacion")
      .populate("categoria")
      .populate("tipo")
      .populate("horario")
      .populate({
        path: "comentarios",
        select: "calificacion", // Solo obtener las calificaciones de los comentarios
      });

    const data = establecimientos.map((est) => {
      const totalResenas = est.comentarios.length;
      const promedioCalificaciones =
        totalResenas > 0
          ? (
              est.comentarios.reduce(
                (total, comentario) => total + comentario.calificacion,
                0
              ) / totalResenas
            ).toFixed(1)
          : 0;

      return {
        ...est.toObject(),
        promedioCalificaciones, // Agregar el promedio al objeto del establecimiento
        totalResenas, // Agregar el total de reseñas
      };
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener los establecimientos:", error);
    res.status(500).json({ message: "Error al obtener los establecimientos" });
  }
};
export const getEstablecimientosAprobados = async (req, res) => {
  try {
    const establecimientos = await Establecimiento.find({ estado: "aprobado" })
      .populate("ubicacion")
      .populate("categoria")
      .populate("tipo")
      .populate("horario")
      .populate({
        path: "comentarios",
        select: "calificacion",
      });

    const data = establecimientos.map((est) => {
      const totalResenas = est.comentarios.length;
      const promedioCalificaciones =
        totalResenas > 0
          ? (
              est.comentarios.reduce(
                (total, comentario) => total + comentario.calificacion,
                0
              ) / totalResenas
            ).toFixed(1)
          : 0;

      return {
        ...est.toObject(),
        promedioCalificaciones,
        totalResenas,
      };
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener los establecimientos aprobados:", error);
    res.status(500).json({ message: "Error al obtener los establecimientos aprobados" });
  }
};

export const getEstablecimientoDelUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const establecimiento = await Establecimiento.findOne({ creador: usuarioId })
      .populate('ubicacion')
      .populate('categoria')
      .populate('tipo')
      .populate('horario')
      .populate({
        path: 'comentarios',
        populate: {
          path: 'usuario',
          select: 'nombreUsuario',
        },
      });

    if (!establecimiento) {
      return res.status(404).json({ message: 'No se encontró un establecimiento para este usuario' });
    }

    const promedioCalificaciones =
      establecimiento.comentarios.length > 0
        ? (
            establecimiento.comentarios.reduce(
              (total, comentario) => total + comentario.calificacion,
              0
            ) / establecimiento.comentarios.length
          ).toFixed(1)
        : 0;

    const respuesta = {
      ...establecimiento.toObject(),
      promedioCalificaciones,
    };

    res.status(200).json(respuesta);
  } catch (error) {
    console.error("Error al obtener el establecimiento del usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener un establecimiento por ID
export const getEstablecimientoById = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el establecimiento por ID y popular los comentarios y usuarios
    const establecimiento = await Establecimiento.findById(id)
    .populate('ubicacion')
    .populate('categoria')
    .populate('tipo')
    .populate('horario')
    .populate({
      path: 'comentarios',
      populate: {
        path: 'usuario',
        select: 'nombreUsuario', // Solo incluir el campo `nombreUsuario`
      },
    });

    // Verificar si el establecimiento existe
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }

    // Calcular el promedio de calificaciones
    const promedioCalificaciones =
      establecimiento.comentarios.length > 0
        ? (
            establecimiento.comentarios.reduce(
              (total, comentario) => total + comentario.calificacion,
              0
            ) / establecimiento.comentarios.length
          ).toFixed(1)
        : 0;

    // Estructurar la respuesta
    const respuesta = {
      ...establecimiento.toObject(),
      promedioCalificaciones,
    };

    res.status(200).json(respuesta);
  } catch (error) {
    console.error("Error al obtener el establecimiento:", error);
    res.status(500).json({ message: "Error al obtener el establecimiento" });
  }
};

// Crear un nuevo establecimiento


export const createEstablecimiento = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      ubicacion,
      categoria,
      tipo,
      horario,
      telefono,
      estado,
      verificado,
      redesSociales
    } = req.body;
    
    const imagen = req.files['imagen']?.[0]?.filename;
    const portada = req.files['portada']?.[0]?.filename;
    const imagenes = req.files['imagenes']?.map(file => file.filename) || [];
    
    // ✅ Parsear ubicacion si viene como string
    const ubicacionesParsed = typeof ubicacion === 'string' ? JSON.parse(ubicacion) : ubicacion;
    
    // ✅ Crear ubicaciones - CORREGIDO para manejar objetos con _id vacío
    let ubicacionesIds = [];
    if (ubicacionesParsed && Array.isArray(ubicacionesParsed)) {
      // Limpiar los datos de ubicación antes de insertarlos
      const ubicacionesLimpias = ubicacionesParsed.map(ubi => {
        // Crear una copia del objeto sin el campo _id si está vacío
        const ubicacionLimpia = { ...ubi };
        if (!ubicacionLimpia._id || ubicacionLimpia._id === "") {
          delete ubicacionLimpia._id;
        }
        return ubicacionLimpia;
      });
      
      // Insertar las ubicaciones limpias
      const ubicacionesCreadas = await Ubicacion.insertMany(ubicacionesLimpias);
      ubicacionesIds = ubicacionesCreadas.map(u => u._id);
    } else if (ubicacionesParsed && typeof ubicacionesParsed === 'object') {
      // Si es un solo objeto en lugar de un array
      const ubicacionLimpia = { ...ubicacionesParsed };
      if (!ubicacionLimpia._id || ubicacionLimpia._id === "") {
        delete ubicacionLimpia._id;
      }
      
      const nuevaUbicacion = new Ubicacion(ubicacionLimpia);
      const ubicacionCreada = await nuevaUbicacion.save();
      ubicacionesIds = [ubicacionCreada._id];
    }
    
    // ✅ Parsear horario si viene como string
    const horariosParsed = typeof horario === 'string' ? JSON.parse(horario) : horario;
    
    // ✅ Crear horarios - Similar a ubicaciones, limpiar _id vacíos
    let horariosIds = [];
    if (horariosParsed && Array.isArray(horariosParsed)) {
      const horariosLimpios = horariosParsed.map(h => {
        const horarioLimpio = { ...h };
        if (!horarioLimpio._id || horarioLimpio._id === "") {
          delete horarioLimpio._id;
        }
        return horarioLimpio;
      });
      
      const horariosCreados = await Horario.insertMany(horariosLimpios);
      horariosIds = horariosCreados.map(h => h._id);
    }
    
    // ✅ Parsear redes sociales si viene como string
    const redesParsed = typeof redesSociales === 'string' ? JSON.parse(redesSociales) : redesSociales;
    
    // ✅ Crear establecimiento
    const nuevoEstablecimiento = new Establecimiento({
      nombre,
      descripcion,
      creador: req.user._id,
      ubicacion: ubicacionesIds,
      categoria,
      tipo,
      horario: horariosIds,
      telefono,
      imagen,
      portada,
      imagenes,
      estado,
      verificado,
      redesSociales: redesParsed
    });
    
    await nuevoEstablecimiento.save();
    
    // ✅ Asociar el establecimiento al usuario creador
    await User.findByIdAndUpdate(req.user._id, {
      $push: { establecimientosCreados: nuevoEstablecimiento._id }
    });
    
    res.status(201).json(nuevoEstablecimiento);
  } catch (error) {
    console.error('Error al crear establecimiento:', error);
    res.status(500).json({ error: 'Error al crear el establecimiento', detalles: error.message });
  }
};




// Actualizar un establecimiento existente
export const updateEstablecimiento = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      nombre,
      descripcion,
      ubicacion,
      categoria,
      tipo,
      horario,
      telefono,
      imagen,
      portada,
      imagenes,
      redesSociales,
      verificado,
      fechaVerificacion,
      seguidores
    } = req.body;

    // Normalizar campos de referencia
    const normalizarIds = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
          return [parsed];
        } catch {
          return val.split(',').map(v => v.trim());
        }
      }
      return [val];
    };

    ubicacion = normalizarIds(ubicacion);
    categoria = normalizarIds(categoria);
    tipo = normalizarIds(tipo);
    horario = normalizarIds(horario);

    const establecimiento = await Establecimiento.findById(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }

    // Solo actualiza los campos si vienen en la petición
    if (typeof nombre !== "undefined") establecimiento.nombre = nombre;
    if (typeof descripcion !== "undefined") establecimiento.descripcion = descripcion;
    if (typeof ubicacion !== "undefined") establecimiento.ubicacion = ubicacion;
    if (typeof categoria !== "undefined") establecimiento.categoria = categoria;
    if (typeof tipo !== "undefined") establecimiento.tipo = tipo;
    if (typeof horario !== "undefined") establecimiento.horario = horario;
    if (typeof telefono !== "undefined") establecimiento.telefono = telefono;
    if (typeof redesSociales !== "undefined") establecimiento.redesSociales = redesSociales;
    if (typeof verificado !== "undefined") establecimiento.verificado = verificado;
    if (typeof fechaVerificacion !== "undefined") establecimiento.fechaVerificacion = fechaVerificacion;
    if (typeof seguidores !== "undefined") establecimiento.seguidores = seguidores;

    // Solo actualiza imágenes si vienen en la petición
    if (typeof imagen !== "undefined") establecimiento.imagen = imagen;
    if (typeof portada !== "undefined") establecimiento.portada = portada;
    if (typeof imagenes !== "undefined") establecimiento.imagenes = imagenes;

    await establecimiento.save();
    res.status(200).json(establecimiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el establecimiento', detalles: error.message });
  }
};


export const buscarEstablecimientoPorNombre = async (req, res) => {
  try {
    // Extraemos el nombre de los parámetros de la query
    const { nombre } = req.query;

    console.log("🔍 Parámetro de búsqueda recibido:", nombre);

    // Si no se pasa el nombre, devolver un error
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ message: "El parámetro 'nombre' es requerido" });
    }

    // Buscar establecimientos que coincidan parcialmente con el nombre (insensible a mayúsculas)
    const establecimientos = await Establecimiento.find({
      nombre: { $regex: nombre, $options: "i" }, // Búsqueda insensible a mayúsculas
    }).lean();

    console.log("✅ Establecimientos encontrados:", establecimientos);

    if (!establecimientos || establecimientos.length === 0) {
      return res.status(404).json({ message: "No se encontraron establecimientos" });
    }

    // Responder con los establecimientos encontrados
    return res.status(200).json(establecimientos);
  } catch (error) {
    // Si ocurre un error, enviamos el error con el mensaje correspondiente
    console.error("❌ Error al buscar establecimientos por nombre:", error.message);
    return res.status(500).json({ message: "Error interno del servidor al buscar establecimientos" });
  }
};

// Eliminar un establecimiento
export const deleteEstablecimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const establecimiento = await Establecimiento.findById(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }
    await establecimiento.deleteOne();
    res.status(200).json({ message: 'Establecimiento eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el establecimiento' });
  }
};

// Seguir un establecimiento
import mongoose from 'mongoose';


export const seguirEstablecimiento = async (req, res) => {
  try {
    const { id } = req.params; // ID del establecimiento
    const userId = req.user.id; // ID del usuario autenticado

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const establecimiento = await Establecimiento.findById(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }

    if (establecimiento.seguidores.includes(userId)) {
      return res.status(400).json({ message: 'Ya sigues este establecimiento' });
    }

    establecimiento.seguidores.push(userId);
    await establecimiento.save();

    res.status(200).json({
      message: 'Has seguido el establecimiento',
      seguido: true,
      seguidores: establecimiento.seguidores.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al seguir el establecimiento' });
  }
};

// Dejar de seguir un establecimiento
export const dejarDeSeguirEstablecimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const establecimiento = await Establecimiento.findById(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }

    if (!establecimiento.seguidores.includes(userId)) {
      return res.status(400).json({ message: 'No sigues este establecimiento' });
    }

    establecimiento.seguidores = establecimiento.seguidores.filter(
      (user) => user.toString() !== userId
    );
    await establecimiento.save();

    res.status(200).json({
      message: 'Has dejado de seguir el establecimiento',
      seguido: false,
      seguidores: establecimiento.seguidores.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al dejar de seguir el establecimiento' });
  }
};
export const likeEstablecimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const establecimiento = await Establecimiento.findById(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }

    if (establecimiento.likes.includes(userId)) {
      return res.status(400).json({ message: 'Ya diste like a este establecimiento' });
    }

    establecimiento.likes.push(userId);
    await establecimiento.save();

    res.status(200).json({
      message: 'Has dado like al establecimiento',
      likeDado: true,
      likes: establecimiento.likes.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al dar like al establecimiento' });
  }
};
export const quitarLikeEstablecimiento = async (req, res) => {
  try {
    const { id } = req.params; // ID del establecimiento
    const userId = req.user.id; // ID del usuario autenticado

    // Verificar si el ID del usuario es válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    // Buscar el establecimiento
    const establecimiento = await Establecimiento.findById(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }

    // Verificar si el usuario ya dio like
    if (!establecimiento.likes.includes(userId)) {
      return res.status(400).json({ message: 'No has dado like a este establecimiento' });
    }

    // Quitar el like
    establecimiento.likes = establecimiento.likes.filter(
      (like) => like.toString() !== userId.toString()
    );
    await establecimiento.save();

    res.status(200).json({
      message: 'Has quitado el like del establecimiento',
      likes: establecimiento.likes.length, // Devolver el número actualizado de likes
    });
  } catch (error) {
    console.error('Error al quitar like:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
export const cambiarVerificado = async (id, nuevoValor) => {
  try {
    const establecimiento = await Establecimiento.findByIdAndUpdate(
      id,
      { verificado: nuevoValor, fechaVerificacion: nuevoValor ? new Date() : null },
      { new: true }
    );
    return establecimiento;
  } catch (error) {
    throw new Error('Error al cambiar el estado de verificación');
  }
};
export const cambiarEstado = async (id, nuevoEstado) => {
  const estadosPermitidos = ['pendiente', 'aprobado', 'rechazado'];
  
  if (!estadosPermitidos.includes(nuevoEstado)) {
    throw new Error(`Estado no válido. Estados permitidos: ${estadosPermitidos.join(', ')}`);
  }
  
  try {
    // Buscar primero el establecimiento para obtener la información del usuario creador
    const establecimientoActual = await Establecimiento.findById(id);
    
    if (!establecimientoActual) {
      throw new Error('Establecimiento no encontrado');
    }
    
    // Verificar que existe el campo creador
    const usuarioCreador = establecimientoActual.creador;
    
    if (!usuarioCreador) {
      throw new Error('No se encontró el usuario creador del establecimiento');
    }
    
    // Actualizar el estado del establecimiento
    const establecimiento = await Establecimiento.findByIdAndUpdate(
      id,
      { estado: nuevoEstado },
      { new: true }
    );
    
    // Crear una notificación para el usuario creador
    const mensaje = `Tu establecimiento "${establecimiento.nombre}" ha cambiado a estado: ${nuevoEstado}`;
    
    // Usar un tipo genérico que probablemente esté permitido en tu esquema
    // Valores comunes: 'sistema', 'alerta', 'notificacion'
    const tipoNotificacion = 'sistema';
    
    // Crear la notificación en la base de datos
    const nuevaNotificacion = new Notificacion({
      usuario: usuarioCreador,
      mensaje,
      tipo: tipoNotificacion
    });
    
    await nuevaNotificacion.save();
    
    return establecimiento;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Error al cambiar el estado del establecimiento: ' + error.message);
  }
};