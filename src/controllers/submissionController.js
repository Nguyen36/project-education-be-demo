const { insertStudent, getCourseById } = require("../services/databaseService");
const { generateVietQR, verifyPayment } = require("../services/paymentService");

require("dotenv").config();

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

module.exports = { verifyPaymentStatus };
