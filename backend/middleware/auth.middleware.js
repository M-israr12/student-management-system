const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token missing. Please log in."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token. Please log in again."
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required."
    });
  }

  next();
}

function requireTeacherOrAdmin(req, res, next) {
  if (!req.user || !["admin", "teacher"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Teacher or admin access required."
    });
  }

  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  requireTeacherOrAdmin
};