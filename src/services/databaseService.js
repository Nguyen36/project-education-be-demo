const sqlite3 = require("better-sqlite3").verbose();
const path = require("path");

const DB_PATH = path.resolve(__dirname, "../../database.sqlite");

let db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // --- Tạo bảng Course ---
    db.run(`
      CREATE TABLE IF NOT EXISTS Course (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error("Error creating Course table:", err.message);
      } else {
        console.log("Course table created or already exists.");
      }
    });

    // --- Tạo bảng Student ---
    db.run(`
      CREATE TABLE IF NOT EXISTS Student (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        message TEXT,
        status TEXT DEFAULT 'pending',
        paid INTEGER DEFAULT 0,
        qr_code_data TEXT,
        transaction_id TEXT UNIQUE,
        paid_at DATETIME,
        course_name TEXT NOT NULL,
        student_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(course_id) REFERENCES Course(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error("Error creating Student table:", err.message);
      } else {
        console.log("Student table created or already exists.");
      }
    });
  }
});

// --- Course Functions ---
const insertCourse = (name, price) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO Course (name, price) VALUES (?, ?) `,
      [name, price],
      function(err) {
        if (err) {
          console.error("Error inserting course:", err.message);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

const getAllCourses = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM Course`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const getCourseById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM Course WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// --- Student Functions ---
const insertStudent = (course_id, course_name,student_id, name, email, message, qr_code_data = null, transaction_id = null, status = "pending", paid = 0) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO Student (course_id, name, email, message, qr_code_data, transaction_id, status, paid, course_name,student_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `,
      [course_id, name, email, message, qr_code_data, transaction_id, status, paid, course_name, student_id],
      function(err) {
        if (err) {
          console.error("Error inserting student:", err.message);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

const getAllStudents = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM Student`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const getStudentById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM Student WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const updateStudentPaymentStatus = (id, transaction_id, status = 'completed') => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE Student SET paid = 1, status = ?, transaction_id = ?, paid_at = DATETIME('now') WHERE id = ?`,
      [status, transaction_id, id],
      function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error(`Student with ID ${id} not found.`));
        else resolve();
      }
    );
  });
};

module.exports = {
  db,
  insertCourse,
  getAllCourses,
  getCourseById,
  insertStudent,
  getAllStudents,
  getStudentById,
  updateStudentPaymentStatus
};
