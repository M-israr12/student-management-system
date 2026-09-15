const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// POST /api/auth/login
function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required." });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid username or password." });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid username or password." });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  res.json({
    success: true,
    message: "Login successful.",
    token,
    user: { id: user.id, name: user.name, username: user.username, role: user.role },
  });
}

// POST /api/auth/register  (creates additional admin/staff accounts)
function register(req, res) {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ success: false, message: "Name, username and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
  }

  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) {
    return res.status(409).json({ success: false, message: "This username is already taken." });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare("INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, 'admin')")
    .run(name, username, hash);

  res.status(201).json({
    success: true,
    message: "Account created successfully. You can now log in.",
    user: { id: result.lastInsertRowid, name, username },
  });
}

// GET /api/auth/me
function me(req, res) {
  const user = db
    .prepare("SELECT id, name, username, role, created_at FROM users WHERE id = ?")
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  res.json({ success: true, user });
}
// POST /api/auth/change-password
function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required."
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long."
    });
  }

  const user = db
    .prepare("SELECT id, password_hash FROM users WHERE id = ?")
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found."
    });
  }

  const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect."
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from current password."
    });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);

  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .run(newHash, req.user.id);

  res.json({
    success: true,
    message: "Password changed successfully."
  });
}
module.exports = { login, register, me, changePassword };

