const Artisan = require("../models/Artisan");
const { normalizePhone } = require("../utils/phone");
const { generateToken } = require("../utils/jwt");
const {
  generateOTP,
  hashOTP,
  compareOTP,
  getOtpExpiryDate,
  getResendCooldownSeconds,
  getMaxOtpAttempts,
  clearOtpFields,
} = require("../utils/otp");
const { ARTISAN_OTP_SELECT } = require("../utils/artisanSelect");

const sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400);
      throw new Error("Phone number is required");
    }

    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      res.status(400);
      throw new Error("Please provide a valid Indian phone number");
    }

    const artisan = await Artisan.findOne({ phone: normalizedPhone }).select(
      ARTISAN_OTP_SELECT
    );

    if (!artisan) {
      res.status(404);
      throw new Error(
        "Phone number is not registered. Please register first."
      );
    }

    const cooldown = getResendCooldownSeconds();

    if (
      artisan.otpLastSentAt &&
      Date.now() - artisan.otpLastSentAt.getTime() < cooldown * 1000
    ) {
      const remaining = Math.ceil(
        (cooldown * 1000 - (Date.now() - artisan.otpLastSentAt.getTime())) /
          1000
      );

      res.status(429);
      throw new Error(
        `Please wait ${remaining} seconds before requesting another OTP`
      );
    }

    const otp = generateOTP();

    artisan.otpHash = await hashOTP(otp);
    artisan.otpExpiresAt = getOtpExpiryDate();
    artisan.otpAttempts = 0;
    artisan.otpLastSentAt = new Date();

    await artisan.save();

    // Demo / development: log and return OTP so the UI can show an alert.
    // Do not return OTP in real production SMS setups.
    const isDemo =
      process.env.NODE_ENV !== "production" ||
      process.env.DEMO_OTP === "true";

    if (isDemo) {
      console.log(`OTP for ${normalizedPhone}: ${otp}`);
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      ...(isDemo ? { otp } : {}),
    });
  } catch (err) {
    next(err);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400);
      throw new Error("Phone number and OTP are required");
    }

    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      res.status(400);
      throw new Error("Please provide a valid Indian phone number");
    }

    if (!/^\d{6}$/.test(otp)) {
      res.status(400);
      throw new Error("OTP must be a 6-digit number");
    }

    const artisan = await Artisan.findOne({ phone: normalizedPhone }).select(
      ARTISAN_OTP_SELECT
    );

    if (!artisan) {
      res.status(404);
      throw new Error("Artisan not found");
    }

    if (!artisan.otpHash || !artisan.otpExpiresAt) {
      res.status(400);
      throw new Error("No OTP requested. Please request a new OTP.");
    }

    if (artisan.otpExpiresAt < new Date()) {
      clearOtpFields(artisan);
      await artisan.save();

      res.status(400);
      throw new Error("OTP has expired. Please request a new OTP.");
    }

    const maxAttempts = getMaxOtpAttempts();

    if (artisan.otpAttempts >= maxAttempts) {
      clearOtpFields(artisan);
      await artisan.save();

      res.status(429);
      throw new Error(
        "Too many incorrect attempts. Please request a new OTP."
      );
    }

    const isValidOTP = await compareOTP(otp, artisan.otpHash);

    if (!isValidOTP) {
      artisan.otpAttempts += 1;
      await artisan.save();

      res.status(401);
      throw new Error("Invalid OTP");
    }

    artisan.phoneVerified = true;
    clearOtpFields(artisan);
    await artisan.save();

    const token = generateToken(artisan._id);

    res.json({
      success: true,
      message: "Phone verified successfully",
      token,
      artisan: {
        id: artisan._id,
        name: artisan.name,
        email: artisan.email,
        phone: artisan.phone,
        craft: artisan.craft,
        cooperative: artisan.cooperative,
        phoneVerified: artisan.phoneVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};
