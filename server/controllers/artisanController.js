const Artisan = require("../models/Artisan");
const Product = require("../models/Product");
const { normalizePhone } = require("../utils/phone");
const { ARTISAN_SENSITIVE_EXCLUDE } = require("../utils/artisanSelect");

const getArtisanWelcome = (req, res) => {
  res.json({ message: "You are the artisan" });
};

const getMe = async (req, res, next) => {
  try {
    const artisan = await Artisan.findById(req.user._id)
      .select(ARTISAN_SENSITIVE_EXCLUDE)
      .populate("cooperative", "name region craftType status");

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

const formatProduct = (product) => {
  const doc = product.toObject ? product.toObject() : product;
  return {
    id: doc._id,
    passportId: String(doc._id),
    name: doc.name,
    description: doc.description || "",
    category: doc.category || "",
    status: doc.status,
    listedPrice: doc.listedPrice,
    artisanPayout: doc.artisanPayout,
    materialsUsed: doc.materialsUsed || "",
    craftStory: doc.craftStory || "",
    region: doc.region || "",
    imageUrl: doc.imageUrl || doc.posterUrl || "",
    videoUrl: doc.videoUrl || "",
    posterUrl: doc.posterUrl || "",
    verifiedAt: doc.verifiedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    artisan: doc.artisan,
    cooperative: doc.cooperative,
  };
};

const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ artisan: req.user._id })
      .populate("cooperative", "name region")
      .sort({ createdAt: -1 });

    res.json(products.map(formatProduct));
  } catch (err) {
    next(err);
  }
};

const getMyProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      artisan: req.user._id,
    }).populate("cooperative", "name region");

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.json(formatProduct(product));
  } catch (err) {
    next(err);
  }
};

/** Create a product passport for the logged-in artisan. */
const createMyProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      materialsUsed,
      craftStory,
      region,
      imageUrl,
      videoUrl,
      posterUrl,
      listedPrice,
      artisanPayout,
    } = req.body;

    if (!name || !String(name).trim()) {
      res.status(400);
      throw new Error("Product name is required");
    }

    if (!req.user.cooperative) {
      res.status(400);
      throw new Error(
        "You are not linked to a cooperative yet. Please contact your cooperative."
      );
    }

    const price = listedPrice === undefined || listedPrice === ""
      ? 0
      : Number(listedPrice);
    const payout = artisanPayout === undefined || artisanPayout === ""
      ? price
      : Number(artisanPayout);

    if (Number.isNaN(price) || price < 0) {
      res.status(400);
      throw new Error("Listed price must be a valid number");
    }

    if (Number.isNaN(payout) || payout < 0) {
      res.status(400);
      throw new Error("Artisan payout must be a valid number");
    }

    const product = await Product.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : "",
      category: category
        ? String(category).trim()
        : req.user.craft || "Handicraft",
      artisan: req.user._id,
      cooperative: req.user.cooperative,
      listedPrice: price,
      artisanPayout: payout,
      materialsUsed: materialsUsed ? String(materialsUsed).trim() : "",
      craftStory: craftStory ? String(craftStory).trim() : "",
      region: region
        ? String(region).trim()
        : req.user.region || "",
      imageUrl: imageUrl
        ? String(imageUrl).trim()
        : posterUrl
          ? String(posterUrl).trim()
          : "",
      videoUrl: videoUrl ? String(videoUrl).trim() : "",
      posterUrl: posterUrl ? String(posterUrl).trim() : "",
      status: "Waiting",
    });

    const populated = await Product.findById(product._id).populate(
      "cooperative",
      "name region"
    );

    res.status(201).json({
      success: true,
      message: "Passport created successfully",
      product: formatProduct(populated),
    });
  } catch (err) {
    next(err);
  }
};

const getMyEarnings = async (req, res, next) => {
  try {
    const products = await Product.find({ artisan: req.user._id }).sort({
      createdAt: -1,
    });

    const items = products.map((p) => ({
      id: p._id,
      passportId: String(p._id),
      productName: p.name,
      listedPrice: p.listedPrice || 0,
      artisanPayout: p.artisanPayout || 0,
      status: p.status,
      date: p.createdAt,
      imageUrl: p.imageUrl || "",
    }));

    const totalEarnings = items.reduce(
      (sum, row) => sum + (row.artisanPayout || 0),
      0
    );

    res.json({
      totalEarnings,
      productCount: items.length,
      items,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getArtisanWelcome,
  getMe,
  registerArtisan,
  getMyProducts,
  getMyProductById,
  createMyProduct,
  getMyEarnings,
};
