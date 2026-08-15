const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const artisanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    craft: {
      type: String,
      trim: true,
      default: "",
    },
    cooperative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
      default: null,
    },
  },
  { timestamps: true }
);

artisanSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

artisanSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Artisan", artisanSchema);
