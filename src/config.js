
// src/config.js

// VARIABLES HARDCODEADAS TEMPORALMENTE - QUITAR CUANDO .env FUNCIONE
const HARDCODED_VARS = {
  JWT_SECRET: 'mitokenjose',
  EMAIL_USER: 'joseaugustonunezvicente@gmail.com',
  EMAIL_PASSWORD: 'vdwz zhuz eyhn pipk',
};

export default {
  mongoURI: 'mongodb+srv://projectamarilis:MpLpamQMdNdJAs56@amarilissalubridad.nouyzcw.mongodb.net/',
  
  // JWT Secret - Prioridad: process.env > hardcoded
  secretKey: process.env.JWT_SECRET || HARDCODED_VARS.JWT_SECRET,
  
  // Email credentials - aunque también las lee directamente desde process.env en authController
  emailUser: process.env.EMAIL_USER || HARDCODED_VARS.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD || HARDCODED_VARS.EMAIL_PASSWORD,
  
  // Puerto del servidor
  port: process.env.PORT || 3000,
};