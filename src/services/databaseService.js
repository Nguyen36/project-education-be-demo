const path = require("path");
const Database = require("better-sqlite3");

// Đường dẫn DB
const DB_PATH = path.resolve(__dirname, "../../database.sqlite");

// Kết nối DB
const db = new Database(DB_PATH, { verbose: console.log });

// --- Tạo bảng Course ---
db.exec(`
  CREATE TABLE IF NOT EXISTS Course (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// --- Tạo bảng Student ---
db.exec(`
  CREATE TABLE IF NOT EXISTS Student (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    paid INTEGER DEFAULT 0,
    qr_code_data TEXT,
    transaction_id TEXT UNIQUE,
    paid_at DATETIME,
    course_name TEXT NOT NULL,
    student_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    price INTEGER DEFAULT 0,
    FOREIGN KEY(course_id) REFERENCES Course(id) ON DELETE CASCADE
  );
`);

// --- Course Functions ---
const insertCourse = (name, price) => {
  const stmt = db.prepare(`INSERT INTO Course (name, price) VALUES (?, ?)`);
  const info = stmt.run(name, price);
  return info.lastInsertRowid;
};

const getAllCourses = () => {
  return db.prepare(`SELECT * FROM Course`).all();
};

const getCourseById = (id) => {
  return db.prepare(`SELECT * FROM Course WHERE id = ?`).get(id);
};

// --- Student Functions ---
const insertStudent = (course_id, course_name, student_id, name, email, message, qr_code_data = null, transaction_id = null, status = "pending", paid = 0) => {
  const stmt = db.prepare(`
    INSERT INTO Student (course_id, name, email, message, qr_code_data, transaction_id, status, paid, course_name, student_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(course_id, name, email, message, qr_code_data, transaction_id, status, paid, course_name, student_id);
  return info.lastInsertRowid;
};

const getAllStudents = () => {
  return db.prepare(`SELECT * FROM Student`).all();
};

const getStudentById = (id) => {
  return db.prepare(`SELECT * FROM Student WHERE id = ?`).get(id);
};

const updateStudentPaymentStatus = (transaction_id, status, paid) => {
  const stmt = db.prepare(`
    UPDATE Student
    SET paid = ?,
        status = ?,
        paid_at = DATETIME('now')
    WHERE transaction_id = ?
  `);

  const info = stmt.run(paid, status, transaction_id);

  if (info.changes === 0) {
    throw new Error(`Student with transaction ID ${transaction_id} not found or no changes made.`);
  }
};

const getStudentByTransactionId = (transaction_id) => {
  return db.prepare(`SELECT * FROM Student WHERE transaction_id = ?`).get(transaction_id);
};

module.exports = {
  db,
  insertCourse,
  getAllCourses,
  getCourseById,
  insertStudent,
  getAllStudents,
  getStudentById,
  updateStudentPaymentStatus,
  getStudentByTransactionId
};
