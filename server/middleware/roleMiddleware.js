/**
 * Role Authorization Middleware (authorize)
 * Purpose: Restricts route access based on allowed user roles (ADMIN, RECEPTIONIST, EMPLOYEE).
 */

const { HTTP_STATUS } = require('../constants');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user object exists (attached by protect middleware)
    if (!req.user || !req.user.role) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required before role check.',
      });
    }

    // Check if user's role is permitted
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' does not have access to this resource.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
