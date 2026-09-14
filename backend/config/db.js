const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const dbDir = path.join(__dirname, "..", "database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "students.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------- Schema ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    course TEXT NOT NULL,
    roll_number TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    grade TEXT,
    address TEXT,
    enrollment_date TEXT NOT NULL DEFAULT (date('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_students_name ON students(full_name);
  CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
  CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
`);

// ---------- Seed default admin user ----------
function seedAdmin() {
  const username = process.env.DEFAULT_ADMIN_USERNAME || "admin";
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (!existing) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(
      "INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, ?)"
    ).run("Administrator", username, hash, "admin");
    console.log(`Seeded default admin user -> username: "${username}", password: "${password}"`);
  }
}

seedAdmin();

module.exports = db;
