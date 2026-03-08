const ApiError = require('../utils/apiError');

module.exports = (err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);

  if (err && err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', details: err.errors });
  }

  if (err && err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({ message: `Duplicate key error: ${field}`, details: err.keyValue });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (err.message || 'Internal Server Error');
  res.status(status).json({ message });
};
