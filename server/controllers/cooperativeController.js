const Cooperative = require("../models/Cooperative");
const Artisan = require("../models/Artisan");
const Product = require("../models/Product");
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

// Register a new Cooperative
const registerCooperative = async (req, res, next) => {
  try {
    const {
      name,
      region,
      craftType,
      registrationNumber,
      supportingDocument,
      phone,
    } = req.body;

    if (!name || !region || !craftType || !registrationNumber || !phone) {
      res.status(400);
      throw new Error(
        "Name, region, craft type, registration number, and mobile number are required"
      );
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      res.status(400);
      throw new Error("Please provide a valid Indian phone number");
    }

    const existingPhone = await Cooperative.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      res.status(400);
      throw new Error("This mobile number is already registered for a cooperative");
    }

    const existingReg = await Cooperative.findOne({
      registrationNumber: registrationNumber.trim(),
    });
    if (existingReg) {
      res.status(400);
      throw new Error("A cooperative with this registration number already exists");
    }

    const cooperative = await Cooperative.create({
      name: name.trim(),
      region: region.trim(),
      craftType: craftType.trim(),
      registrationNumber: registrationNumber.trim(),
      supportingDocument: supportingDocument ? supportingDocument.trim() : "",
      phone: normalizedPhone,
      phoneVerified: false,
    });

    res.status(201).json({
      success: true,
      message: "Cooperative registered successfully! Please log in with your phone number.",
      cooperative: {
        id: cooperative._id,
        name: cooperative.name,
        region: cooperative.region,
        craftType: cooperative.craftType,
        registrationNumber: cooperative.registrationNumber,
        phone: cooperative.phone,
        status: cooperative.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Send OTP for Cooperative Login
const sendCooperativeOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400);
      throw new Error("Mobile number is required");
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      res.status(400);
      throw new Error("Please provide a valid Indian phone number");
    }

    const coop = await Cooperative.findOne({ phone: normalizedPhone }).select(
      "+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt"
    );

    if (!coop) {
      res.status(404);
      throw new Error("Mobile number is not registered as a cooperative. Please sign up first.");
    }

    const cooldown = getResendCooldownSeconds();
    if (
      coop.otpLastSentAt &&
      Date.now() - coop.otpLastSentAt.getTime() < cooldown * 1000
    ) {
      const remaining = Math.ceil(
        (cooldown * 1000 - (Date.now() - coop.otpLastSentAt.getTime())) / 1000
      );
      res.status(429);
      throw new Error(`Please wait ${remaining} seconds before requesting another OTP`);
    }

    const otp = generateOTP();
    coop.otpHash = await hashOTP(otp);
    coop.otpExpiresAt = getOtpExpiryDate();
    coop.otpAttempts = 0;
    coop.otpLastSentAt = new Date();

    await coop.save();

    const isDemo =
      process.env.NODE_ENV !== "production" ||
      process.env.DEMO_OTP === "true";

    if (isDemo) {
      console.log(`Cooperative OTP for ${normalizedPhone}: ${otp}`);
    }

    res.json({
      success: true,
      message: "OTP sent successfully to your mobile number",
      ...(isDemo ? { otp } : {}),
    });
  } catch (err) {
    next(err);
  }
};

// Verify OTP & Login
const verifyCooperativeOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400);
      throw new Error("Mobile number and OTP are required");
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

    const coop = await Cooperative.findOne({ phone: normalizedPhone }).select(
      "+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt"
    );

    if (!coop) {
      res.status(404);
      throw new Error("Cooperative not found");
    }

    if (!coop.otpHash || !coop.otpExpiresAt) {
      res.status(400);
      throw new Error("No OTP requested. Please request a new OTP.");
    }

    if (coop.otpExpiresAt < new Date()) {
      clearOtpFields(coop);
      await coop.save();
      res.status(400);
      throw new Error("OTP has expired. Please request a new OTP.");
    }

    const maxAttempts = getMaxOtpAttempts();
    if (coop.otpAttempts >= maxAttempts) {
      clearOtpFields(coop);
      await coop.save();
      res.status(429);
      throw new Error("Too many incorrect attempts. Please request a new OTP.");
    }

    const isValidOTP = await compareOTP(otp, coop.otpHash);
    if (!isValidOTP) {
      coop.otpAttempts += 1;
      await coop.save();
      res.status(401);
      throw new Error("Invalid OTP");
    }

    coop.phoneVerified = true;
    clearOtpFields(coop);
    await coop.save();

    const token = generateToken(coop._id);

    res.json({
      success: true,
      message: "Cooperative logged in successfully",
      token,
      cooperative: {
        id: coop._id,
        name: coop.name,
        region: coop.region,
        craftType: coop.craftType,
        registrationNumber: coop.registrationNumber,
        supportingDocument: coop.supportingDocument,
        phone: coop.phone,
        status: coop.status,
        phoneVerified: coop.phoneVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get current Cooperative profile & details
const getCooperativeMe = async (req, res, next) => {
  try {
    const coop = req.cooperative;
    const countArtisans = await Artisan.countDocuments({ cooperative: coop._id });
    const countProducts = await Product.countDocuments({ cooperative: coop._id });

    res.json({
      id: coop._id,
      name: coop.name,
      region: coop.region,
      craftType: coop.craftType,
      registrationNumber: coop.registrationNumber,
      supportingDocument: coop.supportingDocument,
      phone: coop.phone,
      status: coop.status,
      phoneVerified: coop.phoneVerified,
      artisanCount: countArtisans,
      productCount: countProducts,
      createdAt: coop.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

// 1. Cooperative Registers an Artisan Under Them
const registerArtisanByCooperative = async (req, res, next) => {
  try {
    const { name, phone, craft, region, experience, email } = req.body;

    if (!name || !phone || !craft) {
      res.status(400);
      throw new Error("Name, mobile number, and craft type are required for artisan registration");
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      res.status(400);
      throw new Error("Please provide a valid 10-digit Indian mobile number");
    }

    const existingPhone = await Artisan.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      res.status(400);
      throw new Error("An artisan is already registered with this mobile number");
    }

    const cleanEmail = email && email.trim()
      ? email.trim().toLowerCase()
      : `artisan_${normalizedPhone.replace(/\D/g, "")}@karigar.org`;

    const existingEmail = await Artisan.findOne({ email: cleanEmail });
    if (existingEmail) {
      res.status(400);
      throw new Error("An artisan is already registered with this email address");
    }

    const artisan = await Artisan.create({
      name: name.trim(),
      phone: normalizedPhone,
      craft: craft.trim(),
      region: region ? region.trim() : req.cooperative.region,
      experience:
        experience != null && String(experience).trim()
          ? String(experience).trim()
          : "Experienced Artisan",
      email: cleanEmail,
      password: "ArtisanPassword123",
      cooperative: req.cooperative._id,
      phoneVerified: true,
    });

    res.status(201).json({
      success: true,
      message: `Artisan ${artisan.name} registered successfully under ${req.cooperative.name}!`,
      artisan: {
        id: artisan._id,
        name: artisan.name,
        phone: artisan.phone,
        craft: artisan.craft,
        region: artisan.region,
        experience: artisan.experience,
        email: artisan.email,
        cooperative: artisan.cooperative,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 2. Get Artisans Registered Under This Cooperative
const getCooperativeArtisans = async (req, res, next) => {
  try {
    const artisans = await Artisan.find({ cooperative: req.cooperative._id }).select(
      "-password"
    );

    // Fetch product counts for each artisan
    const artisanListWithStats = await Promise.all(
      artisans.map(async (art) => {
        const prodCount = await Product.countDocuments({ artisan: art._id });
        return {
          id: art._id,
          name: art.name,
          phone: art.phone,
          craft: art.craft,
          region: art.region || req.cooperative.region,
          experience: art.experience || "Skill Artisan",
          email: art.email,
          productCount: prodCount,
          createdAt: art.createdAt,
        };
      })
    );

    res.json(artisanListWithStats);
  } catch (err) {
    next(err);
  }
};

// 3. Get Products Under This Cooperative
const getCooperativeProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ cooperative: req.cooperative._id })
      .populate("artisan", "name phone craft region experience")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// Create a new Product (by Cooperative or Artisan)
const createProductByCooperative = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      artisanId,
      listedPrice,
      artisanPayout,
      materialsUsed,
      craftStory,
    } = req.body;

    if (!name || !artisanId || !listedPrice || !artisanPayout) {
      res.status(400);
      throw new Error("Product name, artisan, listed price, and artisan payout are required");
    }

    const artisan = await Artisan.findById(artisanId);
    if (!artisan) {
      res.status(404);
      throw new Error("Artisan not found");
    }

    const product = await Product.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      category: category ? category.trim() : artisan.craft || "Handicraft",
      artisan: artisan._id,
      cooperative: req.cooperative._id,
      listedPrice: Number(listedPrice),
      artisanPayout: Number(artisanPayout),
      materialsUsed: materialsUsed ? materialsUsed.trim() : "",
      craftStory: craftStory ? craftStory.trim() : "",
      region: req.body.region ? String(req.body.region).trim() : artisan.region || "",
      imageUrl: req.body.imageUrl ? String(req.body.imageUrl).trim() : "",
      status: "Waiting",
    });

    res.status(201).json({
      success: true,
      message: "Product created and ready for verification",
      product,
    });
  } catch (err) {
    next(err);
  }
};

// 4. Verify / Approve / Report Product Status
const verifyProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { status } = req.body; // "Checked" | "Waiting" | "Reported"

    if (!["Checked", "Waiting", "Reported"].includes(status)) {
      res.status(400);
      throw new Error("Status must be Checked, Waiting, or Reported");
    }

    const product = await Product.findOne({
      _id: productId,
      cooperative: req.cooperative._id,
    });

    if (!product) {
      res.status(404);
      throw new Error("Product not found under your cooperative");
    }

    product.status = status;
    if (status === "Checked") {
      product.verifiedAt = new Date();
    }
    await product.save();

    res.json({
      success: true,
      message: `Product status updated to ${status}`,
      product,
    });
  } catch (err) {
    next(err);
  }
};

// 5. Payout Transparency Data Dashboard
const getPayoutTransparency = async (req, res, next) => {
  try {
    const products = await Product.find({ cooperative: req.cooperative._id })
      .populate("artisan", "name craft region")
      .sort({ createdAt: -1 });

    let totalListed = 0;
    let totalPayout = 0;

    const rows = products.map((p) => {
      const listed = p.listedPrice || 0;
      const payout = p.artisanPayout || 0;
      const coopMargin = Math.max(0, listed - payout);
      const artisanSharePct = listed > 0 ? ((payout / listed) * 100).toFixed(1) : "0.0";

      totalListed += listed;
      totalPayout += payout;

      return {
        id: p._id,
        productName: p.name,
        category: p.category,
        status: p.status,
        artisanName: p.artisan ? p.artisan.name : "Artisan",
        listedPrice: listed,
        artisanPayout: payout,
        coopMargin: coopMargin,
        artisanSharePct: Number(artisanSharePct),
        createdAt: p.createdAt,
      };
    });

    const avgArtisanShare = totalListed > 0
      ? ((totalPayout / totalListed) * 100).toFixed(1)
      : "0.0";

    res.json({
      summary: {
        totalProducts: products.length,
        totalListedValue: totalListed,
        totalPayoutsDisbursed: totalPayout,
        totalCooperativeFee: Math.max(0, totalListed - totalPayout),
        averageArtisanSharePct: Number(avgArtisanShare),
        fairTradeIndex: Number(avgArtisanShare) >= 80 ? "A+ Fair Trade Certified" : "A Standard",
      },
      items: rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
