const express = require("express");
const router = express.Router();

const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getDashboardStats
} = require("../controllers/student.controller");

const {
  verifyToken,
  requireTeacherOrAdmin,
  requireAdmin
} = require("../middleware/auth.middleware");

router.use(verifyToken);

router.get("/stats/dashboard", getDashboardStats);

router.get("/", getStudents);

router.get("/:id", getStudentById);

router.post("/", requireTeacherOrAdmin, createStudent);

router.put("/:id", requireTeacherOrAdmin, updateStudent);

router.delete("/:id", requireAdmin, deleteStudent);

module.exports = router;