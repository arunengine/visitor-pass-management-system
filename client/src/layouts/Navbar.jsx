/**
 * Navbar Component
 * Purpose: Displays header branding, active status, user greeting, and logout button.
 */

import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-800 leading-tight">
            Visitor Pass Management
          </h1>
          <span className="text-xs text-gray-400">Enterprise Access Portal</span>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-800">
            {user?.name || 'Interview Candidate'}
          </p>
          <p className="text-xs text-sky-600 font-medium">
            {user?.role || 'SYSTEM DEMO'}
          </p>
        </div>
        <button
          onClick={logout}
          title="Logout"
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
