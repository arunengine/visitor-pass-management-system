/**
 * Sidebar Component
 * Purpose: Provides role-aware navigation options and quick route switches.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, ShieldAlert } from 'lucide-react';
import { ROUTES } from '../constants';

const Sidebar = () => {
  const navItems = [
    {
      name: 'Admin Dashboard',
      path: ROUTES.ADMIN_DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      name: 'Reception Portal',
      path: ROUTES.RECEPTION_DASHBOARD,
      icon: UserCheck,
    },
    {
      name: 'Employee Portal',
      path: ROUTES.EMPLOYEE_DASHBOARD,
      icon: Users,
    },
    {
      name: 'Unauthorized',
      path: ROUTES.UNAUTHORIZED,
      icon: ShieldAlert,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Navigation
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        Role: <span className="text-sky-400 font-semibold">Junior Developer Demo</span>
      </div>
    </aside>
  );
};

export default Sidebar;
