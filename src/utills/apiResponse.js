class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static success(data, message = "Success") {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = "Resource created successfully") {
    return new ApiResponse(201, data, message);
  }

  static badRequest(message = "Bad Request") {
    return new ApiResponse(400, null, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiResponse(401, null, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiResponse(403, null, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiResponse(404, null, message);
  }

  static internal(message = "Internal Server Error") {
    return new ApiResponse(500, null, message);
  }
}

module.exports = ApiResponse;
