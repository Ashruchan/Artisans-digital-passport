const Artisan = require("../models/Artisan");

// GET /api/artisans — welcome / role check (no DB needed)
const getArtisanWelcome = (req, res) => {
  res.json({ message: "You are the artisan" });
};

// GET /api/artisans/me — current artisan (protected)
const getMe = async (req, res, next) => {
  try {
    const artisan = await Artisan.findById(req.user.id).select("-password");
    if (!artisan) {
      res.status(404);
      throw new Error("Artisan not found");
    }
    res.json(artisan);
  } catch (err) {
    next(err);
  }
};

// POST /api/artisans/register
const registerArtisan = async (req, res, next) => {
  try {
    const { name, email, password, craft } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const exists = await Artisan.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error("Artisan already registered with this email");
    }

    const artisan = await Artisan.create({ name, email, password, craft });

    res.status(201).json({
      id: artisan._id,
      name: artisan.name,
      email: artisan.email,
      craft: artisan.craft,
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
