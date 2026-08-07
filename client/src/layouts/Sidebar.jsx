/**
 * Sidebar Component
 * Purpose: Role-aware navigation menu that dynamically displays only the links
 * permitted for the currently logged-in user's role.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, FileText, History } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, ROLES } from '../constants';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  // Master navigation list with role accessibility rules
  const allNavItems = [
    {
      name: 'Admin Dashboard',
      path: ROUTES.ADMIN_DASHBOARD,
      icon: LayoutDashboard,
      roles: [ROLES.ADMIN],
    },
    {
      name: 'Reception Portal',
      path: ROUTES.RECEPTION_DASHBOARD,
      icon: UserCheck,
      roles: [ROLES.ADMIN, ROLES.RECEPTIONIST],
    },
    {
      name: 'Employee Portal',
      path: ROUTES.EMPLOYEE_DASHBOARD,
      icon: Users,
      roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    },
    {
      name: 'Reports & Analytics',
      path: ROUTES.REPORTS,
      icon: FileText,
      roles: [ROLES.ADMIN, ROLES.RECEPTIONIST],
    },
    {
      name: 'Activity History',
      path: ROUTES.ACTIVITY_HISTORY,
      icon: History,
      roles: [ROLES.ADMIN, ROLES.RECEPTIONIST],
    },
  ];

  // Filter navigation links allowed for current user's role
  const permittedItems = allNavItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Navigation Menu
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {permittedItems.map((item) => {
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
        Active Role: <span className="text-sky-400 font-semibold">{role || 'GUEST'}</span>
      </div>
    </aside>
  );
};

export default Sidebar;
