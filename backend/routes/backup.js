const fs = require("fs");
const path = require("path");
const databasePath = path.join(__dirname, "..", "database", "students.db");
const backupFolder = path.join(__dirname, "backups");
if (!fs.existsSync(databasePath)) {
  console.error(`Database file not found: ${databasePath}`);
  process.exit(1);
}
if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder, { recursive: true });
}
const date = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(backupFolder, `students-${date}.db`);
fs.copyFileSync(databasePath, backupPath);
console.log(`Database backup created: ${backupPath}`);