const Product = require("../models/Product");

const formatPublicPassport = (product) => {
  const doc = product.toObject ? product.toObject() : product;
  const artisan = doc.artisan || {};
  const cooperative = doc.cooperative || {};

  return {
    passportId: String(doc._id),
    id: doc._id,
    name: doc.name,
    description: doc.description || "",
    category: doc.category || "",
    status: doc.status,
    materialsUsed: doc.materialsUsed || "",
    craftStory: doc.craftStory || "",
    region: doc.region || artisan.region || "",
    imageUrl: doc.imageUrl || doc.posterUrl || "",
    videoUrl: doc.videoUrl || "",
    posterUrl: doc.posterUrl || "",
    listedPrice: doc.listedPrice,
    verifiedAt: doc.verifiedAt,
    createdAt: doc.createdAt,
    artisan: {
      id: artisan._id,
      name: artisan.name || "",
      craft: artisan.craft || "",
      region: artisan.region || "",
      photoUrl: artisan.photoUrl || "",
      experience: artisan.experience || "",
      phoneVerified: Boolean(artisan.phoneVerified),
    },
    cooperative: {
      id: cooperative._id,
      name: cooperative.name || "",
      region: cooperative.region || "",
    },
  };
};

const getPublicPassport = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.passportId)
      .populate(
        "artisan",
        "name craft region photoUrl experience phoneVerified"
      )
      .populate("cooperative", "name region");

    if (!product) {
      res.status(404);
      throw new Error("Passport not found");
    }

    res.json(formatPublicPassport(product));
  } catch (err) {
    next(err);
  }
};

/** Buyer report — marks product as Reported for cooperative review. */
const reportPublicPassport = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.passportId)
      .populate(
        "artisan",
        "name craft region photoUrl experience phoneVerified"
      )
      .populate("cooperative", "name region");

    if (!product) {
      res.status(404);
      throw new Error("Passport not found");
    }

    if (product.status === "Reported") {
      res.json({
        success: true,
        message: "This product was already reported.",
        alreadyReported: true,
        passport: formatPublicPassport(product),
      });
      return;
    }

    product.status = "Reported";
    await product.save();

    const refreshed = await Product.findById(product._id)
      .populate(
        "artisan",
        "name craft region photoUrl experience phoneVerified"
      )
      .populate("cooperative", "name region");

    res.json({
      success: true,
      message: "Thank you. This product has been reported for review.",
      alreadyReported: false,
      passport: formatPublicPassport(refreshed),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicPassport, reportPublicPassport };
