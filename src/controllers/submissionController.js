const { insertCourse, insertStudent, getAllCourses, updateStudentPaymentStatus, getCourseById, getStudentById } = require("../services/databaseService");
const { appendSpreadsheet } = require("../services/googleSheetsService");
const { generateVietQR, verifyPayment } = require("../services/paymentService");

const verifyPaymentStatus = async (req, res) => {
  const { name, amount, description, transaction_id } = req.body; // Assuming amount is also sent from frontend

  try {
    const descriptionText = description ? description : `Payment for course registration by ${name}`;
    const qrCodeData = await generateVietQR(amount, descriptionText);
    // 1. Save to SQLite with QR code data and transaction ID

    res.status(200).json({
      message: "Form submitted successfully! Please use the QR code to complete payment.",
      qrCodeData, 
    });
  } catch (error) {
    console.error("Error during form submission:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const submitForm = async (req, res) => {
  const { name,email,courseId,courseName,studentId, qrCodeData, transactionId } = req.body; // studentId is the ID of the student record in our DB

  if (!studentId || !transactionId) {
    return res.status(400).json({ message: "Student ID and Transaction ID are required for payment verification." });
  }
const rowData = [
  studentId,
  name,
  email,
  courseId,
  courseName,
  new Date().toISOString(),
  "Đã thanh toán"
];
  try {
    const verificationResult = await verifyPayment(qrCodeData, transactionId); // Assuming qrCodeData is the identifier for the payment

    if (verificationResult.success) {
       await insertStudent(courseId,courseName, studentId,name, email, null, qrCodeData, transactionId, "success", 1);
       await appendSpreadsheet(rowData);
       res.status(200).json({ message: "Payment verified, student data updated, and recorded in Google Sheet." });
    } else {
      res.status(400).json({ message: verificationResult.message });
    }
  } catch (error) {
    console.error("Error during payment verification:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { submitForm, verifyPaymentStatus };
