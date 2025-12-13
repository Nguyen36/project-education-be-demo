const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/token_generate", authController.generateToken);

module.exports = router;
