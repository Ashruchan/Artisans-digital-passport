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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await Artisan.findById(decoded.id).select("-password");
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, artisan not found");
    }

    next();
  } catch (err) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(401);
    }
    next(err);
  }
};

module.exports = { protect };
