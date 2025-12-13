const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const submissionController = require("../controllers/submissionController");
const paymentController = require("../controllers/paymentController");


// POST /api/register
router.post("/register", registrationController.registerCourse);

// POST /api/submit-form
// router.post("/submit-form", submissionController.submitForm);

// POST /api/verify-payment
// router.post("/verify-payment", submissionController.verifyPaymentStatus);
router.post("/create-payment-url", paymentController.createPaymentUrl);
router.get("/check-payment-vnpay", paymentController.checkPaymentVnpay);

module.exports = router;
