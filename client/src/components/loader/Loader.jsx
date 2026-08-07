/**
 * Reusable Loader Component
 * Purpose: Centered loading spinner animation during async API calls.
 */

import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
      <span className="text-sm text-gray-500 font-medium">{message}</span>
    </div>
  );
};

export default Loader;
