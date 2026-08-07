/**
 * Employee Dashboard Page (Placeholder)
 * Purpose: Workspace for host employees to review pre-registered visitors and approve meeting passes.
 */

import React from 'react';
import Card from '../components/cards/Card';
import Table from '../components/tables/Table';
import { UserCheck, Clock, CheckCircle } from 'lucide-react';

const EmployeeDashboard = () => {
  const dummyHeaders = ['Visitor Name', 'Company', 'Expected Time', 'Purpose', 'Status'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Employee Host Portal</h2>
        <p className="text-sm text-gray-500">
          View your upcoming visitors and approve pending meeting pass requests.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Expected Today" value="4" icon={Clock} />
        <Card title="Checked In" value="2" icon={UserCheck} />
        <Card title="Completed Meetings" value="8" icon={CheckCircle} />
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Visitors (Placeholder)</h3>
        <Table headers={dummyHeaders}>
          <tr>
            <td className="px-4 py-3 font-medium">Siddharth Nair</td>
            <td className="px-4 py-3 text-gray-500">TechCorp Solutions</td>
            <td className="px-4 py-3 text-gray-500">02:00 PM</td>
            <td className="px-4 py-3">Technical Discussion</td>
            <td className="px-4 py-3">
              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full font-medium">
                PENDING APPROVAL
              </span>
            </td>
          </tr>
        </Table>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
