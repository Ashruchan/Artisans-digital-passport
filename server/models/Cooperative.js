const mongoose = require("mongoose");

const cooperativeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Cooperative official name is required"],
      trim: true,
    },

    region: {
      type: String,
      required: [true, "Region of operation is required"],
      trim: true,
    },

    craftType: {
      type: String,
      required: [true, "Craft type represented is required"],
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
    },

    supportingDocument: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "verified",
    },

    // OTP fields
    otpHash: {
      type: String,
      select: false,
    },

    otpExpiresAt: {
      type: Date,
      select: false,
    },

    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    otpLastSentAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cooperative", cooperativeSchema);
