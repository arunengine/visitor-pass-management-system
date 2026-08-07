/**
 * Application Routes Configuration
 * Purpose: Defines client-side routing structure mapping URLs to layouts & page components.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants';

// Layout
import DashboardLayout from '../layouts/DashboardLayout';

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

      {/* Protected Dashboard Layout Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.RECEPTION_DASHBOARD} element={<ReceptionDashboard />} />
        <Route path={ROUTES.EMPLOYEE_DASHBOARD} element={<EmployeeDashboard />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
