// src/controllers/promocionController.js
import Promocion from '../models/promocionModel.js'; // Importamos el modelo Promocion
import Establecimiento from '../models/establecimientoModel.js'; // 👈 importar modelos

// Obtener todas las promociones
export const getPromociones = async (req, res) => {
  try {
    const promociones = await Promocion.find().populate('establecimiento');
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener las promociones' });
  }
};

// Obtener una promoción por su ID
export const getPromocionById = async (req, res) => {
  try {
    const { id } = req.params;
    const promocion = await Promocion.findById(id).populate('establecimiento');
    if (!promocion) {
      return res.status(404).json({ message: 'Promoción no encontrada' });
    }
    res.status(200).json(promocion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener la promoción' });
  }
};

// Crear una nueva promoción
export const createPromocion = async (req, res) => {
  try {
    const { nombre, descripcion, fechaInicio, fechaFin, condiciones, descuento } = req.body;
    const userId = req.user?._id;

    // 1️⃣ Obtener el ID del establecimiento
    const establecimientoId = req.user?.establecimientosCreados?.[0];
    if (!establecimientoId) {
      return res.status(400).json({ message: "El usuario no tiene establecimientos creados" });
    }

    // 2️⃣ Buscar el establecimiento
    const establecimiento = await Establecimiento.findById(establecimientoId);
    if (!establecimiento) {
      return res.status(404).json({ message: "No se encontró un establecimiento para este usuario" });
    }

    // 3️⃣ Validar fechas
    if (!fechaInicio || !fechaFin || new Date(fechaInicio) > new Date(fechaFin)) {
      return res.status(400).json({ message: "Las fechas de la promoción no son válidas" });
    }

    // 4️⃣ Imagen opcional
    let imagen = "";
    if (req.file) {
      imagen = req.file.filename;
    }

    // 5️⃣ Crear nueva promoción
    const newPromocion = new Promocion({
      nombre,
      descripcion,
      fechaInicio,
      fechaFin,
      condiciones,
      descuento,
      imagen,
      establecimiento: establecimiento._id,
    });

    const promocionGuardada = await newPromocion.save();

    // 6️⃣ Actualizar el establecimiento agregando SOLO el ID
    await Establecimiento.findByIdAndUpdate(
      establecimiento._id,
      { $push: { promociones: promocionGuardada._id } }
    );

    // 7️⃣ Volver a consultar el establecimiento con solo los IDs de promociones
    const establecimientoActualizado = await Establecimiento.findById(establecimiento._id)
      .select("promociones")
      .lean();

    res.status(201).json({
      message: "✅ Promoción creada correctamente",
      promocionId: promocionGuardada._id,
      promocionesIds: establecimientoActualizado.promociones, // 👈 Solo IDs
    });
  } catch (error) {
    console.error("Error al crear la promoción:", error.message);
    res.status(500).json({ message: "Error al crear la promoción", error: error.message });
  }
};





// Actualizar una promoción
export const updatePromocion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, fechaInicio, fechaFin, condiciones, descuento, imagen, estado } = req.body;
    const promocion = await Promocion.findById(id);
    if (!promocion) {
      return res.status(404).json({ message: 'Promoción no encontrada' });
    }
    promocion.nombre = nombre || promocion.nombre;
    promocion.descripcion = descripcion || promocion.descripcion;
    promocion.fechaInicio = fechaInicio || promocion.fechaInicio;
    promocion.fechaFin = fechaFin || promocion.fechaFin;
    promocion.condiciones = condiciones || promocion.condiciones;
    promocion.descuento = descuento || promocion.descuento;
    promocion.imagen = imagen || promocion.imagen;
    promocion.estado = estado || promocion.estado;

    await promocion.save();
    res.status(200).json(promocion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al actualizar la promoción' });
  }
};

// Eliminar una promoción
export const deletePromocion = async (req, res) => {
  try {
    const { id } = req.params;
    const promocion = await Promocion.findById(id);
    if (!promocion) {
      return res.status(404).json({ message: 'Promoción no encontrada' });
    }
    await promocion.deleteOne();
    res.status(200).json({ message: 'Promoción eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al eliminar la promoción' });
  }
};
// Obtener promociones por establecimiento
export const getPromocionesByEstablecimiento = async (req, res) => {
  try {
    const { establecimientoId } = req.params;
    
    // Verificar si el establecimiento existe
    const establecimiento = await Establecimiento.findById(establecimientoId);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }
    
    // Buscar promociones que pertenecen al establecimiento
    const promociones = await Promocion.find({ 
      'establecimiento': establecimientoId 
    }).populate('establecimiento');
    
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al obtener las promociones del establecimiento' });
  }
};