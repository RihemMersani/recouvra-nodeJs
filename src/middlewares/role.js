module.exports = function requiredRole(...roles) {
  if (roles.length === 1 && Array.isArray(roles[0])) roles = roles[0];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role === 'admin') return next();
    if (!roles || roles.length === 0) return next();
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
};
