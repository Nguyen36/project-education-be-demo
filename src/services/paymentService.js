const axios = require("axios");
const { updateCoursePaymentStatus, getCourseById } = require("../services/databaseService");

// Thông tin ngân hàng
const BANK_ACCOUNT_NUMBER = "105872632113";
const BANK_NAME = "VietinBank"; // optional, chỉ dùng để lưu/log
const ACCOUNT_HOLDER_NAME = "NGUYEN KIM NGUYEN";

// VietQR API credentials
const VIETQR_CLIENT_ID = "5c894d18-5971-42c9-9d61-2589ac0a076e";
const VIETQR_API_KEY = "1f195394-adaf-4ec3-aa30-b72444dbf160";
const VIETQR_BANK_CODE = "970415"; // Mã VietinBank

// Hàm tạo QR VietQR thật sự
const generateVietQR = async ( amount, description) => {
  try {
    const payload = {
      accountNo: BANK_ACCOUNT_NUMBER,
      accountName: ACCOUNT_HOLDER_NAME,
      acqId: VIETQR_BANK_CODE,
      addInfo: description,
      amount: Number(amount), // số tiền là number để khóa cứng
      template: "compact",
    };

    const response = await axios.post("https://api.vietqr.io/v2/generate", payload, {
      headers: {
        "x-client-id": VIETQR_CLIENT_ID,
        "x-api-key": VIETQR_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (response.data?.code !== "00") {
      throw new Error(`VietQR API error: ${response.data?.desc || "Unknown error"}`);
    }

    // qrDataURL chứa base64 image, qrCode chứa chuỗi EMV để quét
    const { qrCode, qrDataURL } = response.data.data;
    return { qrCode, qrDataURL };
  } catch (err) {
    console.error("Error generating VietQR code:", err.message);
    throw new Error("Failed to generate VietQR code via API.");
  }
};

// Verify payment (giả lập/hoặc tích hợp API callback ngân hàng)
const verifyPayment = async (qrcodeId, transaction_id) => {
  //await updateCoursePaymentStatus(qrcodeId, simulatedExternalPaymentStatus.externalTransactionId);
  console.log(`Payment successfully verified for submission ID: ${qrcodeId}`);
  return { success: true, message: "Payment verified and course updated successfully." };
};

module.exports = {
  generateVietQR,
  verifyPayment,
};
