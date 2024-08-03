const jwt = require("jsonwebtoken");
const logger = require("../config/appLogger");


const authenticateJWT = (req, operationName) => {

  // Define public operations
  const publicOperations = ["register", "login"];

  // Skip authentication for public operations
  if (publicOperations.includes(operationName)) {
    logger.warn(`Skipping authentication for public operation: ${operationName}`);
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("Access Denied: No Authorization header provided");
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    throw new Error("Access Denied: No token provided");
  }

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    logger.info("Middleware - authMiddleware - authenticateJwt - Done");
  } catch (err) {
    logger.error("Middleware - authMiddleware - authenticateJWT - error:", err);
    throw new Error("Invalid Token");
  }
};

const authorizeRoles = (...roles) => {
  return (user) => {
    logger.info("Middleware - authMiddleware - authorizeRoles ");
    if (!user || !roles.includes(user.role)) {
      logger.error("Middleware - authMiddleware - authorizeRoles - error");
      throw new Error("Access Denied: You do not have the right permissions");
    }
    logger.info("Middleware - authMiddleware - authorizeRoles - confirmed");
  };
};


module.exports = { authenticateJWT, authorizeRoles };
