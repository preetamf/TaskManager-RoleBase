const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;
const logger = require('../config/appLogger')

const userSchema = new Schema(
  {
    username: { type: String, required: [true, "username is required"] },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "project-manager", "team-lead", "team-member", "user"],
      default: "user"
    },
    password: { type: String, required: [true, "Password is required"] },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  try {
    const compare = await bcrypt.compare(password, this.password);
    return compare;
  } catch (error) {
    logger.error("Error in password comparison:", error);
    throw new Error("Error in password comparison");
  }
}

userSchema.methods.generateAccessToken = function () {
  logger.info("GENERATING ACCESS TOKEN")
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  logger.info("GENERATING REFRESH TOKEN")
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
