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
  deleteMyProduct,
} = require("../controllers/artisanController");
const { uploadPassportVideo } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");
const { uploadPassportMedia } = require("../middleware/uploadMiddleware");

router.get("/", getArtisanWelcome);
router.post("/register", registerArtisan);
router.get("/me", protect, getMe);
router.get("/products", protect, getMyProducts);
router.get("/products/:productId", protect, getMyProductById);
router.delete("/products/:productId", protect, deleteMyProduct);
router.post(
  "/uploads/video",
  protect,
  uploadPassportMedia,
  uploadPassportVideo
);
router.post("/products", protect, createMyProduct);
router.get("/earnings", protect, getMyEarnings);

module.exports = router;
