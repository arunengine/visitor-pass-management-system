/**
 * ProtectedRoute Component
 * Purpose: Ensures only authenticated users can access child routes.
 * Displays loading spinner while session state is initializing,
 * and redirects unauthenticated users to the Login page.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';
import Loader from '../components/loader/Loader';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking initial auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Verifying session..." />
      </div>
    );
  }

  // Redirect to Login if user is not authenticated
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
