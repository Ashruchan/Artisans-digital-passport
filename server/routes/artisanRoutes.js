const express = require("express");
const router = express.Router();
const {
  getArtisanWelcome,
  getMe,
  registerArtisan,
  getMyProducts,
  getMyProductById,
  createMyProduct,
  getMyEarnings,
} = require("../controllers/artisanController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getArtisanWelcome);
router.post("/register", registerArtisan);
router.get("/me", protect, getMe);
router.get("/products", protect, getMyProducts);
router.get("/products/:productId", protect, getMyProductById);
router.post("/products", protect, createMyProduct);
router.get("/earnings", protect, getMyEarnings);

module.exports = router;
