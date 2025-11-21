const { rateLimit } = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 5 requests per windowMs
  message: "Too many login attempts from this IP, please try again later.",
});

module.exports = { globalLimiter, authLimiter };
