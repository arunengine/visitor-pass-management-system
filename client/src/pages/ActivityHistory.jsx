/**
 * Activity History Page Component
 * Purpose: Displays audit history trail for all visitor actions (created, updated, approved, rejected, checked in, checked out, cancelled).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { History, Search, Filter, ShieldCheck, User } from 'lucide-react';
import Table from '../components/tables/Table';
import Loader from '../components/loader/Loader';

import { getActivities } from '../services/activityService';

const ActivityHistory = () => {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const fetchActivityLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getActivities({
        page,
        limit: 15,
        action: actionFilter,
      });

      if (res?.success) {
        setActivities(res.data.activities);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('[Fetch Activity Error]:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  const tableHeaders = ['Action', 'Visitor Details', 'Performed By', 'User Role', 'Timestamp', 'Remarks'];

  const getActionBadge = (action) => {
    const badges = {
      VISITOR_CREATED: 'bg-blue-100 text-blue-700',
      VISITOR_UPDATED: 'bg-sky-100 text-sky-700',
      VISITOR_APPROVED: 'bg-emerald-100 text-emerald-700',
      VISITOR_REJECTED: 'bg-red-100 text-red-700',
      VISITOR_CHECKED_IN: 'bg-purple-100 text-purple-700',
      VISITOR_CHECKED_OUT: 'bg-indigo-100 text-indigo-700',
      VISITOR_CANCELLED: 'bg-amber-100 text-amber-800',
      VISITOR_ALLOCATED: 'bg-teal-100 text-teal-800',
    };

    return (
      <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${badges[action] || 'bg-gray-100 text-gray-700'}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">System Activity History</h2>
        <p className="text-sm text-gray-500">
          Complete audit trail of visitor registrations, approvals, check-ins, check-outs, and status changes.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-gray-500 font-medium w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <span>Filter by Action:</span>
          </div>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Actions</option>
            <option value="VISITOR_CREATED">VISITOR_CREATED</option>
            <option value="VISITOR_ALLOCATED">VISITOR_ALLOCATED</option>
            <option value="VISITOR_APPROVED">VISITOR_APPROVED</option>
            <option value="VISITOR_REJECTED">VISITOR_REJECTED</option>
            <option value="VISITOR_CHECKED_IN">VISITOR_CHECKED_IN</option>
            <option value="VISITOR_CHECKED_OUT">VISITOR_CHECKED_OUT</option>
            <option value="VISITOR_CANCELLED">VISITOR_CANCELLED</option>
            <option value="VISITOR_UPDATED">VISITOR_UPDATED</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        {isLoading ? (
          <Loader message="Loading activity audit trail..." />
        ) : activities.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <History className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500 font-medium">No Activity Logs Found</p>
          </div>
        ) : (
          <>
            <Table headers={tableHeaders}>
              {activities.map((act) => (
                <tr key={act._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">{getActionBadge(act.action)}</td>
                  <td className="px-4 py-3 text-xs">
                    {act.visitor ? (
                      <div>
                        <p className="font-semibold text-sky-700">{act.visitor.visitorId}</p>
                        <p className="text-gray-800 font-medium">{act.visitor.fullName}</p>
                        <p className="text-gray-400">{act.visitor.company}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {act.performedBy ? (
                      <div>
                        <p className="font-semibold text-gray-800">{act.performedBy.name}</p>
                        <p className="text-gray-400">{act.performedBy.email}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-gray-600">{act.role}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(act.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 italic">
                    {act.remarks || 'No remarks'}
                  </td>
                </tr>
              ))}
            </Table>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div>
                Showing Page <span className="font-semibold text-gray-800">{pagination.page}</span> of{' '}
                <span className="font-semibold text-gray-800">{pagination.totalPages}</span> ({pagination.total} Total Logs)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityHistory;
