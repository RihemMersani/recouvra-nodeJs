const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization required' });
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid authorization format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    const user = await User.findById(payload.sub).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid token (user not found)' });
    if (user.isActive === false) return res.status(401).json({ message: 'User inactive' });
    req.user = { sub: user._id.toString(), role: user.role, ...user.toObject() };
    next();
  } catch (err) {
    if (err && err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' });
    return res.status(401).json({ message: 'Invalid token' });
  }
};