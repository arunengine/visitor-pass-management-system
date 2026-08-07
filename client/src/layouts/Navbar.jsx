/**
 * Navbar Component
 * Purpose: Header bar displaying application title, logged-in user details, and logout action button.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Brand Header */}
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

      {/* Logged in User Profile & Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-800">
            {user?.name || 'Authenticated User'}
          </p>
          <p className="text-xs text-sky-600 font-medium">
            {user?.role || 'GUEST'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
