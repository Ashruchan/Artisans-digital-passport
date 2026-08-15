const express = require("express");
const router = express.Router();
const {
  getArtisanWelcome,
  getMe,
  registerArtisan,
} = require("../controllers/artisanController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getArtisanWelcome);
router.post("/register", registerArtisan);
router.get("/me", protect, getMe);

module.exports = router;
