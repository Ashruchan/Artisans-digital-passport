const express = require("express");
const router = express.Router();
const {
  getPublicPassport,
  reportPublicPassport,
} = require("../controllers/passportController");

router.get("/:passportId", getPublicPassport);
router.post("/:passportId/report", reportPublicPassport);

module.exports = router;
