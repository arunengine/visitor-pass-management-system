/**
 * RoleRoute Component
 * Purpose: Enforces Role-Based Access Control (RBAC) on routes.
 * Checks if the logged-in user's role is in the allowedRoles array.
 * Redirects unauthorized users to the Unauthorized page.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';
import Loader from '../components/loader/Loader';

const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Checking permissions..." />
      </div>
    );
  }

  // If user role is not permitted, redirect to Unauthorized page
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  // Render child routes if role is permitted
  return <Outlet />;
};

export default RoleRoute;
