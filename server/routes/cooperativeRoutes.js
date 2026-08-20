const express = require("express");
const router = express.Router();
const {
  registerCooperative,
  sendCooperativeOTP,
  verifyCooperativeOTP,
  getCooperativeMe,
  registerArtisanByCooperative,
  getCooperativeArtisans,
  getCooperativeProducts,
  createProductByCooperative,
  verifyProduct,
  getPayoutTransparency,
} = require("../controllers/cooperativeController");
const { protectCooperative } = require("../middleware/authMiddleware");

// Public Cooperative auth routes
router.post("/register", registerCooperative);
router.post("/send-otp", sendCooperativeOTP);
router.post("/verify-otp", verifyCooperativeOTP);

// Protected Cooperative routes
router.get("/me", protectCooperative, getCooperativeMe);

// Artisan management by Cooperative
router.post("/artisan", protectCooperative, registerArtisanByCooperative);
router.get("/artisans", protectCooperative, getCooperativeArtisans);

// Product & Verification management
router.get("/products", protectCooperative, getCooperativeProducts);
router.post("/products", protectCooperative, createProductByCooperative);
router.patch("/products/:productId/verify", protectCooperative, verifyProduct);

// Payout Transparency Dashboard
router.get("/transparency", protectCooperative, getPayoutTransparency);

module.exports = router;
