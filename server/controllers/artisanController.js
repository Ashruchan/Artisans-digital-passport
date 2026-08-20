const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Artisan = require("../models/Artisan");

const normalizePhone = (phone) => {
  if (!phone) return null;

  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }

  return null;
};
const generateToken = (artisanId) => {
  return jwt.sign(
    { id: artisanId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const getArtisanWelcome = (req, res) => {
  res.json({
    message: "You are the artisan",
  });
};

const getMe = async (req, res, next) => {
  try {
    const artisan = await Artisan.findById(req.user.id).select(
      "-password -otpHash -otpExpiresAt -otpAttempts -otpLastSentAt"
    );

    if (!artisan) {
      res.status(404);
      throw new Error("Artisan not found");
    }

    res.json(artisan);
  } catch (err) {
    next(err);
  }
};

const registerArtisan = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      craft,
      cooperative,
    } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400);
      throw new Error(
        "Name, email, password, and phone number are required"
      );
    }

    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      res.status(400);
      throw new Error("Please provide a valid Indian phone number");
    }

    const existingEmail = await Artisan.findOne({ email });

    if (existingEmail) {
      res.status(400);
      throw new Error(
        "Artisan already registered with this email"
      );
    }

    const existingPhone = await Artisan.findOne({
      phone: normalizedPhone,
    });

    if (existingPhone) {
      res.status(400);
      throw new Error(
        "This phone number is already registered"
      );
    }

    const artisan = await Artisan.create({
      name,
      email,
      password,
      phone: normalizedPhone,
      craft,
      cooperative: cooperative || null,
      phoneVerified: false,
    });

    res.status(201).json({
      success: true,
      message:
        "Artisan registered successfully. Please verify your phone number using OTP.",
      id: artisan._id,
      name: artisan.name,
      email: artisan.email,
      phone: artisan.phone,
      craft: artisan.craft,
      phoneVerified: artisan.phoneVerified,
    });
  } catch (err) {
    next(err);
  }
};

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

    // Find registered artisan
    const artisan = await Artisan.findOne({
      phone: normalizedPhone,
    }).select(
      "+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt"
    );

    if (!artisan) {
      res.status(404);
      throw new Error(
        "Phone number is not registered. Please register first."
      );
    }

    // 60-second resend cooldown
    const cooldown =
      Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;

    if (
      artisan.otpLastSentAt &&
      Date.now() - artisan.otpLastSentAt.getTime() <
        cooldown * 1000
    ) {
      const remaining = Math.ceil(
        (cooldown * 1000 -
          (Date.now() - artisan.otpLastSentAt.getTime())) /
          1000
      );

      res.status(429);
      throw new Error(
        `Please wait ${remaining} seconds before requesting another OTP`
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Hash OTP
    const otpHash = await require("bcryptjs").hash(otp, 10);

    const expiryMinutes =
      Number(process.env.OTP_EXPIRY_MINUTES) || 5;

    artisan.otpHash = otpHash;
    artisan.otpExpiresAt = new Date(
      Date.now() + expiryMinutes * 60 * 1000
    );
    artisan.otpAttempts = 0;
    artisan.otpLastSentAt = new Date();

    await artisan.save();

    if (process.env.NODE_ENV === "development") {
      console.log(
        `OTP for ${normalizedPhone}: ${otp}`
      );
    }
    res.json({
      success: true,
      message: "OTP sent successfully",
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

    const artisan = await Artisan.findOne({
      phone: normalizedPhone,
    }).select(
      "+otpHash +otpExpiresAt +otpAttempts"
    );

    if (!artisan) {
      res.status(404);
      throw new Error("Artisan not found");
    }

    if (!artisan.otpHash || !artisan.otpExpiresAt) {
      res.status(400);
      throw new Error(
        "No OTP requested. Please request a new OTP."
      );
    }

    // Check expiry
    if (artisan.otpExpiresAt < new Date()) {
      artisan.otpHash = undefined;
      artisan.otpExpiresAt = undefined;
      artisan.otpAttempts = 0;

      await artisan.save();

      res.status(400);
      throw new Error(
        "OTP has expired. Please request a new OTP."
      );
    }

    // Maximum attempts
    const maxAttempts =
      Number(process.env.OTP_MAX_ATTEMPTS) || 5;

    if (artisan.otpAttempts >= maxAttempts) {
      artisan.otpHash = undefined;
      artisan.otpExpiresAt = undefined;

      await artisan.save();

      res.status(429);
      throw new Error(
        "Too many incorrect attempts. Please request a new OTP."
      );
    }

    // Compare OTP
    const bcrypt = require("bcryptjs");

    const isValidOTP = await bcrypt.compare(
      otp,
      artisan.otpHash
    );

    if (!isValidOTP) {
      artisan.otpAttempts += 1;
      await artisan.save();

      res.status(401);
      throw new Error("Invalid OTP");
    }

    // OTP is correct
    artisan.phoneVerified = true;

    // Invalidate OTP so it cannot be reused
    artisan.otpHash = undefined;
    artisan.otpExpiresAt = undefined;
    artisan.otpAttempts = 0;

    await artisan.save();

    // Generate JWT
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
  getArtisanWelcome,
  getMe,
  registerArtisan,
  sendOTP,
  verifyOTP,
};