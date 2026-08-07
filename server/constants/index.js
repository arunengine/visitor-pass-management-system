/**
 * Application Constants
 * Purpose: Centralized constant values used across the backend application
 * to prevent magic strings and hardcoded values.
 */

// User Roles
const ROLES = {
  ADMIN: 'ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
  EMPLOYEE: 'EMPLOYEE',
};

// HTTP Status Codes for standard response handling
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = {
  ROLES,
  HTTP_STATUS,
};
