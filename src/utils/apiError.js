class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status || 500;
    if (details) this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
