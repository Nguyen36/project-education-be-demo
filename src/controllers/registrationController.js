const { insertStudent, getCourseById } = require("../services/databaseService");

const registerCourse = async (req, res) => {
  const { name, email, studentId, course } = req.body;

  // Basic validation
  if (!name || !email || !studentId || !course) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Email format validation
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  // Student ID format validation (example: assumes numeric)
  if (!/^[0-9]+$/.test(studentId)) {
    return res.status(400).json({ error: "Student ID must be numeric." });
  }

  try {
    const existingCourse = await getCourseById(course);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found." });
    }

    // `insertStudent` parameters: course_id, name, email, message, qr_code_data, transaction_id, status, paid
    // Initially, message, qr_code_data, transaction_id are null, status is 'pending', paid is 0.
    const studentIdInt = parseInt(studentId, 10);
    // If studentId is not meant to be transaction_id, then it should be added as a separate column in the Student table.
    // For now, I'll use it as a transaction_id placeholder.
    const newStudentId = await insertStudent(existingCourse.id, name, email, null, null, studentIdInt, "pending", 0);
    
    res.status(200).json({ message: "Student registered successfully with pending payment.", studentId: newStudentId });
  } catch (error) {
    console.error("Error registering course:", error);
    res.status(500).json({ error: "Failed to register course." });
  }
};

module.exports = { registerCourse };
