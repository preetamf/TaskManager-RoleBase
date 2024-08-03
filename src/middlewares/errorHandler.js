const ApiResponse = require("../utills/apiResponse"); // Ensure the correct path to ApiResponse
const logger = require("../config/appLogger");

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.statusCode || 500} - ${err.message} - ${req.method} ${req.url}`);

  // Handle custom API errors
  if (err.statusCode) {
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, null, err.message));
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    const statusCode = 400;
    const message = err.details[0].message;
    logger.error(`Validation Error: ${message}`);
    return res.status(statusCode).json(ApiResponse.badRequest(message));
  }

  // Handle other errors
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json(ApiResponse.internal(message));
};

module.exports = errorHandler;
