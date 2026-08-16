const rateLimit = require('express-rate-limit');

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication requests',
    code: 'RATE_LIMITED',
    details: {},
  },
  statusCode: 429,
});

module.exports = { authRateLimiter };
