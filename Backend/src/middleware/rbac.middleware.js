const { ApiError } = require('../utils/errors');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError('Forbidden', 'FORBIDDEN', 403));
    }
    next();
  };
}

module.exports = { requireRole };
