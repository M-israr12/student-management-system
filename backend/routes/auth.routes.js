const express = require("express");
const router = express.Router();

const {
  login,
  register,
  me,
  changePassword
} = require("../controllers/auth.controller");

const {
  verifyToken,
  requireAdmin
} = require("../middleware/auth.middleware");

router.post("/login", login);

router.post("/register", verifyToken, requireAdmin, register);

router.get("/me", verifyToken, me);

router.post("/change-password", verifyToken, changePassword);

module.exports = router;