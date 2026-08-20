const Artisan = require("../models/Artisan");
const { normalizePhone } = require("../utils/phone");
const { ARTISAN_SENSITIVE_EXCLUDE } = require("../utils/artisanSelect");

const getArtisanWelcome = (req, res) => {
  res.json({ message: "You are the artisan" });
};

const getMe = async (req, res, next) => {
  try {
    const artisan = await Artisan.findById(req.user.id).select(
      ARTISAN_SENSITIVE_EXCLUDE
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
    const { name, email, password, phone, craft, cooperative } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400);
      throw new Error("Name, email, password, and phone number are required");
    }

    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      res.status(400);
      throw new Error("Please provide a valid Indian phone number");
    }

    const existingEmail = await Artisan.findOne({ email });
    if (existingEmail) {
      res.status(400);
      throw new Error("Artisan already registered with this email");
    }

    const existingPhone = await Artisan.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      res.status(400);
      throw new Error("This phone number is already registered");
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

module.exports = {
  getArtisanWelcome,
  getMe,
  registerArtisan,
};
