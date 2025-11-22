import jwt from "jsonwebtoken";

export default function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token ausente" });
  }

  const parts = authHeader.split(" ");
  const token = parts.length === 2 ? parts[1] : parts[0]; // soporta "Bearer <token>" o solo "<token>"

  if (!token) {
    return res.status(401).json({ message: "Token ausente" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}
