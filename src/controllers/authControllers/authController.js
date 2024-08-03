const User = require("../../models/user.modal");
const jwt = require("jsonwebtoken");
const asyncWrapper = require("../../utills/asyncWrapper");
const logger = require("../../config/appLogger");
const {registerSchema,loginSchema,} = require("../../validators/authValidator");

const register = asyncWrapper(async (_, args) => {
  logger.info("Graphql - Resolver - authResolver - register - start");

  try {
    await registerSchema.validateAsync(args);
  } catch (err) {
    logger.error("Validation error during user registration:", err);
    throw new Error(err.message);
  }

  const { username, email, password, role } = args;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    logger.error("Graphql - Resolver - authResolver - register - error");
    throw new Error("User already exists");
  }

  const user = await User.create({ username, email, password, role });

  logger.info("Graphql - Resolver - authResolver - register - end");
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
  };
});

const login = asyncWrapper(async (_, args) => {
  logger.info("Graphql - Resolver - authResolver - login - start");

  try {
    await loginSchema.validateAsync(args);
  } catch (error) {
    logger.error("Validation error during user login:", error);
    throw new Error(err.message);
  }

  const { email, password } = args;
  const user = await User.findOne({ email });
  if (!user) {
    logger.error("Graphql - Resolver - authResolver - login - error");
    throw new Error("User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    logger.error("Graphql - Resolver - authResolver - login - error");
    throw new Error("Invalid password");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  logger.info("Graphql - Resolver - authResolver - login - end");

  return {
    email,
    accessToken,
    refreshToken,
  };
});

const logout = asyncWrapper(async (_, { userId }) => {
  logger.info("Graphql - Resolver - authResolver - logout - start");
  await User.findByIdAndUpdate(userId, { refreshToken: null });
  logger.info("Graphql - Resolver - authResolver - logout - end");
  return true;
});

const refreshToken = asyncWrapper(async (_, { token }) => {
  logger.info("Graphql - Resolver - authResolver - refreshToken - start");
  const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(payload._id);
  if (!user || user.refreshToken !== token) {
    throw new Error("Invalid refresh token");
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save();

  logger.info("Graphql - Resolver - authResolver - refreshToken - end");

  return {
    email: user.email,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
});

module.exports = { register, login, logout, refreshToken };
