const express = require("express");
const router = express.Router();

const {
  getTeachers,
  createTeacher,
  deleteTeacher
} = require("../controllers/user.controller");

const {
  verifyToken,
  requireAdmin
} = require("../middleware/auth.middleware");

router.use(verifyToken);
router.use(requireAdmin);

router.get("/teachers", getTeachers);
router.post("/teachers", createTeacher);
router.delete("/teachers/:id", deleteTeacher);

module.exports = router;