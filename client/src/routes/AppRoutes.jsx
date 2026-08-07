/**
 * Application Routes Configuration
 * Purpose: Configures application client-side route tree with ProtectedRoute and RoleRoute protection.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES, ROLES } from '../constants';

// Layout
import DashboardLayout from '../layouts/DashboardLayout';

// Protection Wrappers
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Pages
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import ReceptionDashboard from '../pages/ReceptionDashboard';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />

      {/* Protected Routes (Requires Login) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Default redirect to Login or Dashboard */}
          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

          {/* Admin Only Route */}
          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
          </Route>

          {/* Receptionist Only Route */}
          <Route element={<RoleRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]} />}>
            <Route path={ROUTES.RECEPTION_DASHBOARD} element={<ReceptionDashboard />} />
          </Route>

          {/* Employee Only Route */}
          <Route element={<RoleRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.ADMIN]} />}>
            <Route path={ROUTES.EMPLOYEE_DASHBOARD} element={<EmployeeDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
