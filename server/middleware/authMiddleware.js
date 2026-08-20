const jwt = require("jsonwebtoken");
const Artisan = require("../models/Artisan");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const artisan = await Artisan.findById(decoded.id).select(
      "-password -otpHash -otpExpiresAt -otpAttempts -otpLastSentAt"
    );

    if (!artisan) {
      res.status(401);
      throw new Error(
        "Not authorized, artisan not found"
      );
    }

    if (!artisan.phoneVerified) {
      res.status(401);
      throw new Error(
        "Phone number is not verified"
      );
    }

    req.user = artisan;

    next();
  } catch (err) {
    res.status(401);
    next(err);
  }
};

module.exports = { protect };