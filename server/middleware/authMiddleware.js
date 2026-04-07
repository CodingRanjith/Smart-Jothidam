const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Middleware to verify JWT from Authorization header
 * Header: Authorization: Bearer <jwtToken>
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authorization token is required', 401);
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return errorResponse(res, 'Invalid authorization format', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      phone: decoded.phone ?? null,
      mobileVerified: decoded.mobileVerified ?? false,
    };

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

module.exports = { authenticate };
