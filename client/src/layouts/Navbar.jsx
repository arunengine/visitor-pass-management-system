/**
 * Navbar Component
 * Purpose: Header bar displaying application title, logged-in user details, and logout action button.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

const Navbar = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm max-w-full">
      {/* Mobile Menu Toggle & Brand Header */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg md:hidden transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="p-2 bg-sky-100 text-sky-600 rounded-lg shrink-0">
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-gray-800 leading-tight truncate">
            Visitor Pass Management
          </h1>
          <span className="text-[10px] sm:text-xs text-gray-400 block truncate">Enterprise Access Portal</span>
        </div>
      </div>

      {/* Logged in User Profile & Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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
