const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.token;
  if (!token) throw new ApiError(401, 'Authentication required');

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findOne({ email: payload.sub });
    if (!user) throw new ApiError(401, 'User not found');
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid authentication credentials');
  }
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = await User.findOne({ email: payload.sub });
  } catch (_) {
    req.user = null;
  }
  return next();
});

function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) return next(new ApiError(403, 'Admin access required'));
  return next();
}

module.exports = { protect, optionalAuth, requireAdmin };
