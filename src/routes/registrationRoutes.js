const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const submissionController = require("../controllers/submissionController");

// POST /api/register
router.post("/register", registrationController.registerCourse);

// POST /api/submit-form
router.post("/submit-form", submissionController.submitForm);

// POST /api/verify-payment
router.post("/verify-payment", submissionController.verifyPaymentStatus);


module.exports = router;
