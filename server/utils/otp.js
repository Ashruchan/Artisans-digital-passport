const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = async (otp) => {
  return bcrypt.hash(otp, 10);
};

const compareOTP = async (otp, otpHash) => {
  return bcrypt.compare(otp, otpHash);
};

const getOtpExpiryDate = () => {
  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 5;
  return new Date(Date.now() + expiryMinutes * 60 * 1000);
};

const getResendCooldownSeconds = () => {
  return Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
};

const getMaxOtpAttempts = () => {
  return Number(process.env.OTP_MAX_ATTEMPTS) || 5;
};

const clearOtpFields = (artisan) => {
  artisan.otpHash = undefined;
  artisan.otpExpiresAt = undefined;
  artisan.otpAttempts = 0;
};

module.exports = {
  generateOTP,
  hashOTP,
  compareOTP,
  getOtpExpiryDate,
  getResendCooldownSeconds,
  getMaxOtpAttempts,
  clearOtpFields,
};
