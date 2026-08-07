/**
 * Unauthorized Page (Placeholder)
 * Purpose: Displayed when a user attempts to access a route restricted for their role.
 */

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800">403 - Access Denied</h2>
      <p className="text-gray-500 mt-2 max-w-md">
        You do not have permission to view this page. Please contact your system administrator if you believe this is an error.
      </p>
      <Link
        to={ROUTES.ADMIN_DASHBOARD}
        className="mt-6 inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium text-sm"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
