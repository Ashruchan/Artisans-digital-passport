const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "Handicraft",
    },

    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artisan",
      required: true,
    },

    cooperative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
      required: true,
    },

    status: {
      type: String,
      enum: ["Waiting", "Checked", "Reported"],
      default: "Waiting",
    },

    listedPrice: {
      type: Number,
      required: [true, "Listed price is required"],
      min: 0,
    },

    artisanPayout: {
      type: Number,
      required: [true, "Artisan payout is required"],
      min: 0,
    },

    materialsUsed: {
      type: String,
      trim: true,
      default: "",
    },

    craftStory: {
      type: String,
      trim: true,
      default: "",
    },

    region: {
      type: String,
      trim: true,
      default: "",
    },

    /** Product / passport photo (URL or data URL for demo). */
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
