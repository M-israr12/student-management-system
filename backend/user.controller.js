const bcrypt = require("bcryptjs");
const db = require("../config/db");

// GET /api/users/teachers
function getTeachers(req, res) {
  const teachers = db
    .prepare(
      `SELECT id, name, username, role, created_at
       FROM users
       WHERE role = 'teacher'
       ORDER BY created_at DESC`
    )
    .all();

  res.json({
    success: true,
    data: teachers
  });
}

// POST /api/users/teachers
function createTeacher(req, res) {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, username and password are required."
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long."
    });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username);

  if (existing) {
    return res.status(409).json({
      success: false,
      message: "This username is already taken."
    });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const result = db
    .prepare(
      `INSERT INTO users
       (name, username, password_hash, role)
       VALUES (?, ?, ?, 'teacher')`
    )
    .run(name, username, passwordHash);

  res.status(201).json({
    success: true,
    message: "Teacher account created successfully.",
    data: {
      id: result.lastInsertRowid,
      name,
      username,
      role: "teacher"
    }
  });
}

// DELETE /api/users/teachers/:id
function deleteTeacher(req, res) {
  const teacher = db
    .prepare(
      "SELECT id, role FROM users WHERE id = ?"
    )
    .get(req.params.id);

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found."
    });
  }

  if (teacher.role !== "teacher") {
    return res.status(400).json({
      success: false,
      message: "Only teacher accounts can be removed here."
    });
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);

  res.json({
    success: true,
    message: "Teacher account deleted successfully."
  });
}

module.exports = {
  getTeachers,
  createTeacher,
  deleteTeacher
};