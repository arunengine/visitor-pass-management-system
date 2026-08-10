/**
 * Dashboard Layout
 * Purpose: Main wrapper layout combining top Navbar, left Sidebar, and Outlet for page rendering.
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={toggleMobileMenu}
      />

      {/* Main Container: Sidebar + Page Content */}
      <div className="flex flex-1 relative max-w-full overflow-x-hidden">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={closeMobileMenu}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
