/**
 * Admin Dashboard Page (Placeholder)
 * Purpose: Central control panel for System Administrators to manage users, roles, and overall metrics.
 */

import React from 'react';
import Card from '../components/cards/Card';
import Table from '../components/tables/Table';
import { Users, Ticket, CheckCircle2, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const dummyHeaders = ['User ID', 'Name', 'Role', 'Status', 'Actions'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-sm text-gray-500">
          Overview of system metrics, active users, and visitor activity.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Users" value="24" icon={Users} />
        <Card title="Active Passes" value="18" icon={Ticket} />
        <Card title="Checked In" value="12" icon={CheckCircle2} />
        <Card title="Pending Approvals" value="6" icon={Clock} />
      </div>

      {/* Placeholder Data Table */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">System Users (Placeholder)</h3>
        <Table headers={dummyHeaders}>
          <tr>
            <td className="px-4 py-3">USR-001</td>
            <td className="px-4 py-3 font-medium">Arun Kumar</td>
            <td className="px-4 py-3">ADMIN</td>
            <td className="px-4 py-3">
              <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full font-medium">
                Active
              </span>
            </td>
            <td className="px-4 py-3 text-sky-600 cursor-pointer font-medium hover:underline">
              Edit
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3">USR-002</td>
            <td className="px-4 py-3 font-medium">Priya Sharma</td>
            <td className="px-4 py-3">RECEPTIONIST</td>
            <td className="px-4 py-3">
              <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full font-medium">
                Active
              </span>
            </td>
            <td className="px-4 py-3 text-sky-600 cursor-pointer font-medium hover:underline">
              Edit
            </td>
          </tr>
        </Table>
      </div>
    </div>
  );
};

export default AdminDashboard;
