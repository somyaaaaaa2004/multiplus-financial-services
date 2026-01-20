const { sendError } = require('../utils/response');

/**
 * Admin-only middleware
 * Must be used after authMiddleware to ensure req.user exists
 * Restricts access to admin users only
 */
const adminOnly = (req, res, next) => {
  try {
    // Check if user is authenticated (authMiddleware should run first)
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    // Check if user is admin
    if (req.userRole !== 'admin' && req.user.role !== 'admin') {
      return sendError(res, 'Access denied. Admin privileges required.', 403);
    }

    next();
  } catch (error) {
    return sendError(res, 'Authorization check failed.', 500);
  }
};

module.exports = adminOnly;
