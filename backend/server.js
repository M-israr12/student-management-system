require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

require("./config/db"); // initializes DB + seeds default admin

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- API routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running." });
});

// ---------- Serve frontend (optional, for single-port deployment) ----------
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

// ---------- 404 + error handling ----------
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`   Frontend also served from the same port.\n`);
});
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

require("./config/db"); // initializes DB + seeds default admin

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- API routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running." });
});

// ---------- Serve frontend (optional, for single-port deployment) ----------
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});
module.exports = {};
// ---------- 404 + error handling ----------
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`   Frontend also served from the same port.\n`);
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`   Frontend also served from the same port.\n`);
});