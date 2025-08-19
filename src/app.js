import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import tipoRoutes from "./routes/tipoRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import ubicacionRoutes from "./routes/ubicacionRoutes.js";
import horarioRoutes from "./routes/horarioRoutes.js";
import establecimientoRoutes from "./routes/establecimientoRoutes.js";
import comentarioRoutes from "./routes/comentarioRoutes.js";
import notificacionRoutes from "./routes/notificacionRoutes.js";
import promocionRoutes from "./routes/promocionRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Habilitar CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'headers'] // Include 'headers' here
}));



// Configurar rutas

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tipos', tipoRoutes);
app.use('/categorias', categoriaRoutes);
app.use('/ubicaciones', ubicacionRoutes);
app.use('/horarios', horarioRoutes);
app.use('/establecimientos', establecimientoRoutes);
app.use('/comentarios', comentarioRoutes);
app.use('/notificaciones', notificacionRoutes);
app.use('/promociones', promocionRoutes)

export default app;
