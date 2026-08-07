/**
 * Reception Dashboard Page (Placeholder)
 * Purpose: Workspace for reception desk staff to check-in/check-out visitors and issue passes.
 */

import React from 'react';
import Card from '../components/cards/Card';
import Table from '../components/tables/Table';
import Button from '../components/buttons/Button';
import { UserCheck, LogOut, Ticket } from 'lucide-react';

const ReceptionDashboard = () => {
  const dummyHeaders = ['Pass ID', 'Visitor Name', 'Host Employee', 'Check-In Time', 'Status'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reception Desk</h2>
          <p className="text-sm text-gray-500">
            Manage live visitor check-ins, pass generation, and checkout timestamps.
          </p>
        </div>
        <Button variant="primary">+ Issue New Pass (Placeholder)</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Visitors Today" value="35" icon={UserCheck} />
        <Card title="Currently Inside" value="14" icon={Ticket} />
        <Card title="Checked Out Today" value="21" icon={LogOut} />
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Today's Visitors (Placeholder)</h3>
        <Table headers={dummyHeaders}>
          <tr>
            <td className="px-4 py-3 font-semibold">PASS-901</td>
            <td className="px-4 py-3">Rahul Verma</td>
            <td className="px-4 py-3">Arun Kumar</td>
            <td className="px-4 py-3 text-gray-500">10:30 AM</td>
            <td className="px-4 py-3">
              <span className="px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded-full font-medium">
                INSIDE
              </span>
            </td>
          </tr>
        </Table>
      </div>
    </div>
  );
};

export default ReceptionDashboard;
