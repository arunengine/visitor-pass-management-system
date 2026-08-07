/**
 * 404 Not Found Page (Placeholder)
 * Purpose: Displayed when navigating to an unmapped path in React Router.
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gray-50">
      <div className="p-4 bg-sky-100 text-sky-600 rounded-full mb-4">
        <HelpCircle className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800">404 - Page Not Found</h2>
      <p className="text-gray-500 mt-2 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to={ROUTES.ADMIN_DASHBOARD}
        className="mt-6 inline-flex items-center px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium text-sm"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
