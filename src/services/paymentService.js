const axios = require("axios");
const { updateCoursePaymentStatus, getCourseById } = require("../services/databaseService");
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require("vnpay");
const crypto = require("crypto");
const qs = require("qs");
require("dotenv").config();

// Thông tin ngân hàng

// Hàm tạo QR VietQR thật sự
const generateVietQR = async ( amount, description) => {
  try {
    const payload = {
      accountNo: process.env.BANK_ACCOUNT_NUMBER, // Assuming these are in .env
      accountName: process.env.ACCOUNT_HOLDER_NAME, // Assuming these are in .env
      acqId: process.env.VIETQR_BANK_CODE, // Assuming these are in .env
      addInfo: description,
      amount: Number(amount), // số tiền là number để khóa cứng
      template: "compact",
    };

    const response = await axios.post("https://api.vietqr.io/v2/generate", payload, {
      headers: {
        "x-client-id": process.env.VIETQR_CLIENT_ID, // Assuming these are in .env
        "x-api-key": process.env.VIETQR_API_KEY, // Assuming these are in .env
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

const generateVNPAY = async (amount, description, ipAddr,idPayment) => {
  const vnpay = new VNPay({
    tmnCode: process.env.VNPAY_TMNCODE,
    secureSecret: process.env.VNPAY_SECRET_KEY,
    vnpayHost: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    testMode: true, // tùy chọn
    hashAlgorithm: "SHA512", // tùy chọn
    loggerFn: ignoreLogger, // tùy chọn
  });
  const expireTime = new Date();
  expireTime.setMinutes(expireTime.getMinutes() + 15);

  const vnpayUrl = await vnpay.buildPaymentUrl({
    vnp_Amount: amount, //
    vnp_IpAddr: ipAddr || "127.0.0.1", // Use provided IP or default
    vnp_TxnRef: idPayment,
    vnp_OrderInfo: description,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: "http://localhost:3001/api/check-payment-vnpay", //
    vnp_Locale: VnpLocale.VN, // "vn" hoặc "en"
    vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
    vnp_ExpireDate: dateFormat(expireTime), // tùy chọn
  });
  return { vnpayUrl, vnp_TxnRef: idPayment };
};

const validateVnpayHash = (vnp_Params, secretKey) => {
  const secureHash = vnp_Params["vnp_SecureHash"];
  const data = { ...vnp_Params };
  delete data["vnp_SecureHash"];
  delete data["vnp_SecureHashType"];

  const sortedKeys = Object.keys(data).sort();
  const sortedData = {};
  sortedKeys.forEach(k => sortedData[k] = data[k]);

  const signData = qs.stringify(sortedData, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  return signed.toUpperCase() === secureHash.toUpperCase();
};

const renderHtml = (isSuccess, message, value = {}) => `
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Payment Status</title>
<style>
  body { display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; }
  .circle { width:120px; height:120px; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:60px; color:#fff; background-color:${isSuccess ? "#4CAF50" : "#F44336"}; box-shadow:0 4px 8px rgba(0,0,0,0.2);}
  .message { margin-top:20px; font-size:24px; color:${isSuccess ? "#4CAF50" : "#F44336"}; font-weight:bold; text-align:center; }
  .details { margin-top:15px; font-size:18px; text-align:center; }
</style>
</head>
<body>
  <div class="circle">${isSuccess ? "✔" : "✖"}</div>
  <div class="message">${message}</div>
  <div class="details">
    ${value.name ? `Học viên: ${value.name}<br>` : ""}
    ${value.courseName ? `Khóa học: ${value.courseName}<br>` : ""}
    ${value.amount ? `Số tiền: ${Number(value.amount).toLocaleString()} VNĐ<br>` : ""}
    ${value.transactionId ? `Mã giao dịch: ${value.transactionId}` : ""}
  </div>
</body>
</html>
`;

module.exports = {
  generateVietQR,
  verifyPayment,
  generateVNPAY,
  validateVnpayHash,
  renderHtml,
};
