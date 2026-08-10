/**
 * Employee Dashboard Page
 * Purpose: Workspace for host employees to review pending visitor appointment requests,
 * approve or reject requests with remarks, and view approved/rejected visit logs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

import Card from '../components/cards/Card';
import Table from '../components/tables/Table';
import Loader from '../components/loader/Loader';
import VisitorDrawer from '../components/visitors/VisitorDrawer';
import ApprovalModal from '../components/visitors/ApprovalModal';

import {
  getMyPendingVisitors,
  getMyApprovedVisitors,
  getMyRejectedVisitors,
  approveVisitor,
  rejectVisitor,
} from '../services/visitorService';
import { getEmployeeDashboardStats } from '../services/dashboardService';

const EmployeeDashboard = () => {
  // Live Employee Stats
  const [employeeStats, setEmployeeStats] = useState(null);

  // Active Tab ('PENDING' | 'APPROVED' | 'REJECTED')
  const [activeTab, setActiveTab] = useState('PENDING');

  // Visitor List Data & Pagination
  const [visitors, setVisitors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Search & Page
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Drawer & Modal State
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [approvalAction, setApprovalAction] = useState('APPROVE'); // 'APPROVE' | 'REJECT'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Live Employee Stats
  const fetchEmployeeStats = useCallback(async () => {
    try {
      const res = await getEmployeeDashboardStats();
      if (res?.success) {
        setEmployeeStats(res.data);
      }
    } catch (err) {
      console.error('[Fetch Employee Stats Error]:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchEmployeeStats();
  }, [fetchEmployeeStats]);

  // Fetch Requests based on active tab
  const fetchMyVisitors = useCallback(async () => {
    setIsLoading(true);
    try {
      let fetchFunc = getMyPendingVisitors;
      if (activeTab === 'APPROVED') fetchFunc = getMyApprovedVisitors;
      if (activeTab === 'REJECTED') fetchFunc = getMyRejectedVisitors;

      const res = await fetchFunc({
        page,
        limit: 10,
        search: searchTerm,
      });

      if (res?.success) {
        setVisitors(res.data.visitors);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch visitor requests', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, searchTerm]);

  useEffect(() => {
    fetchMyVisitors();
  }, [fetchMyVisitors]);

  // Handle Approve / Reject Confirmation
  const handleConfirmApprovalAction = async (remarks) => {
    if (!approvalTarget) return;
    setIsSubmitting(true);
    setModalError('');
    try {
      let res;
      if (approvalAction === 'APPROVE') {
        res = await approveVisitor(approvalTarget._id, remarks);
      } else {
        res = await rejectVisitor(approvalTarget._id, remarks);
      }

      if (res?.success) {
        showToast(
          `Visitor ${approvalTarget.visitorId} ${
            approvalAction === 'APPROVE' ? 'APPROVED' : 'REJECTED'
          } successfully!`
        );
        setApprovalTarget(null);
        fetchMyVisitors();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableHeaders = [
    'Visitor ID',
    'Visitor Name & Contact',
    'Company & Purpose',
    'Visit Date & Time',
    'ID Proof',
    'Status',
    'Actions',
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Employee Host Portal</h2>
        <p className="text-sm text-gray-500">
          Review pending visitor appointment requests, approve or decline meetings, and manage visit history.
        </p>
      </div>

      {/* Toast Banner */}
      {toast && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm animate-fade-in ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs font-bold uppercase tracking-wider hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card
          title="Pending Requests"
          value={employeeStats ? employeeStats.pendingRequests : '--'}
          icon={Clock}
        />
        <Card
          title="Approved Requests"
          value={employeeStats ? employeeStats.approvedRequests : '--'}
          icon={CheckCircle}
        />
        <Card
          title="Rejected Requests"
          value={employeeStats ? employeeStats.rejectedRequests : '--'}
          icon={XCircle}
        />
        <Card
          title="Today's Visitors"
          value={employeeStats ? employeeStats.todayVisitors : '--'}
          icon={UserCheck}
        />
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-gray-200 overflow-x-auto max-w-full whitespace-nowrap">
        <button
          onClick={() => {
            setActiveTab('PENDING');
            setPage(1);
          }}
          className={`py-3 px-4 sm:px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>Pending Approvals {activeTab === 'PENDING' && `(${pagination.total})`}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('APPROVED');
            setPage(1);
          }}
          className={`py-3 px-4 sm:px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'APPROVED'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Approved Requests {activeTab === 'APPROVED' && `(${pagination.total})`}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('REJECTED');
            setPage(1);
          }}
          className={`py-3 px-4 sm:px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'REJECTED'
              ? 'border-red-600 text-red-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <XCircle className="w-4 h-4 shrink-0" />
          <span>Rejected Requests {activeTab === 'REJECTED' && `(${pagination.total})`}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Visitor Name, Phone, ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        {isLoading ? (
          <Loader message="Loading visitor requests..." />
        ) : visitors.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-semibold text-gray-700">No {activeTab} Visitor Requests</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              You currently have no visitor appointment requests in the {activeTab.toLowerCase()} status queue.
            </p>
          </div>
        ) : (
          <>
            <Table headers={tableHeaders}>
              {visitors.map((v) => (
                <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-sky-700">{v.visitorId}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{v.fullName}</p>
                    <p className="text-xs text-gray-500">{v.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-gray-700">{v.company}</p>
                    <p className="text-xs text-gray-500">{v.purposeOfVisit}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    <p className="font-medium">
                      {new Date(v.visitDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-gray-400">{v.expectedArrivalTime}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {v.idProofType}
                    <br />
                    <span className="text-gray-400 font-mono">{v.idProofNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                        v.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : v.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* View Drawer */}
                      <button
                        onClick={() => {
                          setSelectedVisitor(v);
                          setIsDrawerOpen(true);
                        }}
                        title="View Details"
                        className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Approve Button (Only for Pending) */}
                      {v.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setApprovalTarget(v);
                            setApprovalAction('APPROVE');
                            setModalError('');
                          }}
                          title="Approve Request"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}

                      {/* Reject Button (Only for Pending) */}
                      {v.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setApprovalTarget(v);
                            setApprovalAction('REJECT');
                            setModalError('');
                          }}
                          title="Reject Request"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </Table>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div>
                Showing Page <span className="font-semibold text-gray-800">{pagination.page}</span> of{' '}
                <span className="font-semibold text-gray-800">{pagination.totalPages}</span> ({pagination.total} Total Requests)
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

      {/* Details Drawer */}
      <VisitorDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedVisitor(null);
        }}
        visitor={selectedVisitor}
      />

      {/* Approval / Rejection Modal */}
      <ApprovalModal
        isOpen={Boolean(approvalTarget)}
        onClose={() => setApprovalTarget(null)}
        onConfirm={handleConfirmApprovalAction}
        visitor={approvalTarget}
        actionType={approvalAction}
        isSubmitting={isSubmitting}
        error={modalError}
      />
    </div>
  );
};

export default EmployeeDashboard;
