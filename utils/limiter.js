const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 20, // limit of requests per windowMs
});

module.exports = limiter;
