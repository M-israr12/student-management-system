const db = require("../config/db");

function validateStudentPayload(body, isUpdate = false) {
  const errors = [];
  if (!isUpdate || body.full_name !== undefined) {
    if (!body.full_name || !body.full_name.trim()) errors.push("Full name is required.");
  }
  if (!isUpdate || body.email !== undefined) {
    if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) errors.push("A valid email is required.");
  }
  if (!isUpdate || body.course !== undefined) {
    if (!body.course || !body.course.trim()) errors.push("Course is required.");
  }
  if (body.status !== undefined && !["active", "inactive"].includes(body.status)) {
    errors.push("Status must be either 'active' or 'inactive'.");
  }
  return errors;
}

// GET /api/students?search=&status=&course=&page=&limit=
function getStudents(req, res) {
  const { search = "", status = "", course = "", page = 1, limit = 10 } = req.query;

  const conditions = [];
  const params = {};

  if (search) {
    conditions.push("(full_name LIKE @search OR email LIKE @search OR roll_number LIKE @search OR course LIKE @search)");
    params.search = `%${search}%`;
  }
  if (status) {
    conditions.push("status = @status");
    params.status = status;
  }
  if (course) {
    conditions.push("course = @course");
    params.course = course;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const total = db
    .prepare(`SELECT COUNT(*) AS count FROM students ${whereClause}`)
    .get(params).count;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const offset = (pageNum - 1) * limitNum;

  const students = db
    .prepare(
      `SELECT * FROM students ${whereClause} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: limitNum, offset });

  res.json({
    success: true,
    data: students,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
}

// GET /api/students/:id
function getStudentById(req, res) {
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: "Student not found." });
  }
  res.json({ success: true, data: student });
}

// POST /api/students
function createStudent(req, res) {
  const errors = validateStudentPayload(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }

  const {
    full_name,
    email,
    phone = null,
    course,
    roll_number = null,
    status = "active",
    grade = null,
    address = null,
    enrollment_date = null,
  } = req.body;

  try {
    const result = db
      .prepare(
        `INSERT INTO students (full_name, email, phone, course, roll_number, status, grade, address, enrollment_date)
         VALUES (@full_name, @email, @phone, @course, @roll_number, @status, @grade, @address, COALESCE(@enrollment_date, date('now')))`
      )
      .run({ full_name, email, phone, course, roll_number, status, grade, address, enrollment_date });

    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ success: true, message: "Student added successfully.", data: student });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ success: false, message: "A student with this email or roll number already exists." });
    }
    res.status(500).json({ success: false, message: "Something went wrong while adding the student." });
  }
}

// PUT /api/students/:id
function updateStudent(req, res) {
  const existing = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Student not found." });
  }

  const errors = validateStudentPayload(req.body, true);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }

  const updated = { ...existing, ...req.body, updated_at: new Date().toISOString() };

  try {
    db.prepare(
      `UPDATE students SET
        full_name = @full_name,
        email = @email,
        phone = @phone,
        course = @course,
        roll_number = @roll_number,
        status = @status,
        grade = @grade,
        address = @address,
        enrollment_date = @enrollment_date,
        updated_at = datetime('now')
       WHERE id = @id`
    ).run(updated);

    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
    res.json({ success: true, message: "Student updated successfully.", data: student });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ success: false, message: "A student with this email or roll number already exists." });
    }
    res.status(500).json({ success: false, message: "Something went wrong while updating the student." });
  }
}

// DELETE /api/students/:id
function deleteStudent(req, res) {
  const existing = db.prepare("SELECT id FROM students WHERE id = ?").get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Student not found." });
  }
  db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
  res.json({ success: true, message: "Student deleted successfully." });
}

// GET /api/students/stats/dashboard
function getDashboardStats(req, res) {
  const total = db.prepare("SELECT COUNT(*) AS count FROM students").get().count;
  const active = db.prepare("SELECT COUNT(*) AS count FROM students WHERE status = 'active'").get().count;
  const inactive = db.prepare("SELECT COUNT(*) AS count FROM students WHERE status = 'inactive'").get().count;
  const addedThisMonth = db
    .prepare(
      `SELECT COUNT(*) AS count FROM students
       WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`
    )
    .get().count;

  const byCourse = db
    .prepare(
      `SELECT course, COUNT(*) AS count FROM students GROUP BY course ORDER BY count DESC LIMIT 8`
    )
    .all();

  const recent = db
    .prepare("SELECT id, full_name, email, course, status, created_at FROM students ORDER BY created_at DESC LIMIT 5")
    .all();

  res.json({
    success: true,
    data: { total, active, inactive, addedThisMonth, byCourse, recent },
  });
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getDashboardStats,
};
