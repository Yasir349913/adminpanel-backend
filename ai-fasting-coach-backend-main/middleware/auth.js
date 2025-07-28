const jwt = require('jsonwebtoken');
const { Unauthenticated } = require('../errors');
const { env } = require('../config');

// Middleware to verify JWT and extract user
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Unauthenticated('Authentication invalid');
  }

  const token = authHeader.split(' ')[1];
  const payload = jwt.verify(token, env.JWT_SECRET);

  req.user = {
    userId: payload.userId,
    role: payload.role,
  };

  next();
};

// Middleware to restrict access to admins only
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new Unauthenticated('Admin access only');
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
