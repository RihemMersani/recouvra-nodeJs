const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');

const ApiError = require('../utils/apiError');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(401, 'Invalid credentials');
    const ok = await user.comparePassword(password);
    if (!ok) throw new ApiError(401, 'Invalid credentials');
    if (user.isActive === false) throw new ApiError(401, 'User inactive');
    const payload = { sub: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev', { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
