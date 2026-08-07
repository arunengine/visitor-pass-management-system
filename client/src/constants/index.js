/**
 * Frontend Constants
 * Purpose: Centralizes application route constants, roles, and UI configuration settings.
 */

// Application Navigation Routes
export const ROUTES = {
  LOGIN: '/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  RECEPTION_DASHBOARD: '/reception/dashboard',
  EMPLOYEE_DASHBOARD: '/employee/dashboard',
  REPORTS: '/reports',
  ACTIVITY_HISTORY: '/activity-history',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
};

// User Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
  EMPLOYEE: 'EMPLOYEE',
};
