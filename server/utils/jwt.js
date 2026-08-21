const jwt = require("jsonwebtoken");

const generateToken = (artisanId) => {
  return jwt.sign({ id: artisanId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = { generateToken };
