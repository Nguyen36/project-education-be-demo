const { getCourseById, insertStudent, updateStudentPaymentStatus, getStudentByTransactionId } = require("../services/databaseService");
const { generateVNPAY, validateVnpayHash, renderHtml } = require("../services/paymentService");
const { appendSpreadsheet } = require("../services/googleSheetsService");
const { v4: uuidv4, v1: uuidv1 } = require("uuid");

const createPaymentUrl = async (req, res) => {
  const { courseId, name, email, studentId, amount,courseName,qrCodeData ,transactionId,description} = req.body;

  if (!courseId || !name || !email || !studentId || !amount) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  try {
    const course = await getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    const idPayment = uuidv4();
    // Create a pending student record. transaction_id will be updated after VNPay returns it.
    const newStudentId = await insertStudent(
      courseId,
      course.name, // course_name
      studentId,
      name,
      email,
      null, // message
      null, // qr_code_data
      idPayment, // transaction_id (will be updated)
      "PENDING",
      amount // paid
    );
    console.log(req.ip,"req.ip")
    const vnpayResponse = await generateVNPAY(amount, description, req.ip,idPayment);
    res.status(200).json({ message: vnpayResponse.vnpayUrl });
  } catch (error) {
    console.error("Error creating VNPay payment URL:", error.message);
    res.status(500).json({ message: "Internal server error: " + error.message });
  }
};

const checkPaymentVnpay = async (req, res) => {
  const secretKey = process.env.VNPAY_SECRET_KEY;
  const vnp_Params = req.query;

  try {
    // 1. Verify hash
    if (!validateVnpayHash(vnp_Params, secretKey)) {
      return res
        .status(400)
        .send(renderHtml(false, "Hash không hợp lệ. Thanh toán không xác thực."));
    }

    const transactionId = vnp_Params["vnp_TxnRef"];
    const transactionStatus = vnp_Params["vnp_TransactionStatus"];

    // 2. Lấy student từ DB (SOURCE OF TRUTH)
    const student = await getStudentByTransactionId(transactionId);

    if (!student) {
      // Không bao giờ tự tạo student trong callback
      console.error("Student not found for transaction:", transactionId);
      return res
        .status(404)
        .send(renderHtml(false, "Không tìm thấy đơn thanh toán."));
    }

    // 3. Idempotency
    if (student.status === "PAID") {
      return res.status(200).send(
        renderHtml(true, "Thanh toán đã được xử lý trước đó.", {
          name: student.name,
          courseName: student.course_name,
          amount: student.amount,
          transactionId,
        })
      );
    }

    // 4. Xử lý kết quả
    if (transactionStatus === "00") {
      // SUCCESS
      await updateStudentPaymentStatus(transactionId, "PAID", 1);

      // Ghi Google Sheet DUY NHẤT 1 LẦN
      await appendSpreadsheet([
        student.student_id,
        student.name,
        student.email,
        student.course_id,
        student.course_name,
        new Date().toISOString(),
        "PAID",
        student.amount
      ]);

      return res.status(200).send(
        renderHtml(true, "Thanh toán thành công", {
          name: student.name,
          courseName: student.course_name,
          amount: student.amount,
          transactionId,
        })
      );
    } else {
      // FAILED
      if (student.status === "PENDING") {
        await updateStudentPaymentStatus(transactionId, "FAILED", 0);
      }

      return res.status(200).send(
        renderHtml(false, "Thanh toán thất bại", {
          name: student.name,
          courseName: student.course_name,
          amount: student.amount,
          transactionId,
        })
      );
    }
  } catch (error) {
    console.error("VNPay callback error:", error);
    return res
      .status(500)
      .send(renderHtml(false, "Đã xảy ra lỗi khi xác thực thanh toán."));
  }
};

module.exports = {
  createPaymentUrl,
  checkPaymentVnpay,
};
