/**
 * Reception Dashboard Page
 * Purpose: Reception Desk workspace for registering visitors, managing check-ins and check-outs,
 * viewing visitors currently inside, today's check-ins, and today's check-outs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Eye,
  Edit2,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  LogIn,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

import Card from '../components/cards/Card';
import Table from '../components/tables/Table';
import Button from '../components/buttons/Button';
import Loader from '../components/loader/Loader';

import VisitorModal from '../components/visitors/VisitorModal';
import VisitorDrawer from '../components/visitors/VisitorDrawer';
import CancelConfirmModal from '../components/modal/CancelConfirmModal';
import CheckInModal from '../components/modal/CheckInModal';
import CheckOutModal from '../components/modal/CheckOutModal';

import {
  getVisitors,
  createVisitor,
  updateVisitor,
  cancelVisitor,
  getActiveVisitorsInside,
  getTodayCheckIns,
  getTodayCheckOuts,
  checkInVisitor,
  checkOutVisitor,
} from '../services/visitorService';
import { getEmployees } from '../services/employeeService';
import { getReceptionDashboardStats } from '../services/dashboardService';

const ReceptionDashboard = () => {
  // Live Reception Stats
  const [receptionStats, setReceptionStats] = useState(null);

  // Active Tab ('ALL' | 'INSIDE' | 'CHECKINS' | 'CHECKOUTS')
  const [activeTab, setActiveTab] = useState('ALL');

  // Visitor List & Pagination
  const [visitors, setVisitors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Active employees for filter dropdown
  const [activeEmployees, setActiveEmployees] = useState([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Modal & Drawer states
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [checkInTarget, setCheckInTarget] = useState(null);
  const [checkOutTarget, setCheckOutTarget] = useState(null);

  // Action Pending states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [modalError, setModalError] = useState('');

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Host Employees for filter dropdown
  useEffect(() => {
    const fetchEmployeesList = async () => {
      try {
        const res = await getEmployees({ status: 'Active', limit: 100 });
        if (res?.success) {
          setActiveEmployees(res.data.employees);
        }
      } catch (err) {
        console.error('[Fetch Filter Employees Error]:', err.message);
      }
    };
    fetchEmployeesList();
  }, []);

  // Fetch Live Reception Stats
  const fetchReceptionStats = useCallback(async () => {
    try {
      const res = await getReceptionDashboardStats();
      if (res?.success) {
        setReceptionStats(res.data);
      }
    } catch (err) {
      console.error('[Fetch Reception Stats Error]:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchReceptionStats();
  }, [fetchReceptionStats]);

  // Fetch Visitors List based on Active Tab
  const fetchVisitorsData = useCallback(async () => {
    setIsLoading(true);
    try {
      let fetchFunc = getVisitors;
      let extraParams = {
        search: searchTerm,
        visitDate: dateFilter,
        employeeId: employeeFilter,
        status: statusFilter,
      };

      if (activeTab === 'INSIDE') {
        fetchFunc = getActiveVisitorsInside;
        extraParams = { search: searchTerm };
      } else if (activeTab === 'CHECKINS') {
        fetchFunc = getTodayCheckIns;
        extraParams = { search: searchTerm };
      } else if (activeTab === 'CHECKOUTS') {
        fetchFunc = getTodayCheckOuts;
        extraParams = { search: searchTerm };
      }

      const res = await fetchFunc({
        page,
        limit: 10,
        ...extraParams,
      });

      if (res?.success) {
        setVisitors(res.data.visitors);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch visitors', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, searchTerm, dateFilter, employeeFilter, statusFilter]);

  useEffect(() => {
    fetchVisitorsData();
  }, [fetchVisitorsData]);

  // Handle Register Visitor
  const handleRegisterVisitor = async (data) => {
    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await createVisitor(data);
      if (res?.success) {
        showToast(`Visitor ${res.data.visitor.visitorId} registered successfully!`);
        setIsVisitorModalOpen(false);
        fetchVisitorsData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Visitor
  const handleUpdateVisitor = async (data) => {
    if (!selectedVisitor) return;
    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await updateVisitor(selectedVisitor._id, data);
      if (res?.success) {
        showToast(`Visitor ${selectedVisitor.visitorId} updated successfully!`);
        setIsVisitorModalOpen(false);
        setSelectedVisitor(null);
        fetchVisitorsData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Cancel Registration
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsActionPending(true);
    try {
      const res = await cancelVisitor(cancelTarget._id);
      if (res?.success) {
        showToast(`Visitor registration ${cancelTarget.visitorId} cancelled.`);
        setCancelTarget(null);
        fetchVisitorsData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  // Handle Check In
  const handleConfirmCheckIn = async () => {
    if (!checkInTarget) return;
    setIsActionPending(true);
    try {
      const res = await checkInVisitor(checkInTarget._id);
      if (res?.success) {
        showToast(`Visitor ${checkInTarget.visitorId} CHECKED IN successfully!`);
        setCheckInTarget(null);
        fetchVisitorsData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  // Handle Check Out
  const handleConfirmCheckOut = async () => {
    if (!checkOutTarget) return;
    setIsActionPending(true);
    try {
      const res = await checkOutVisitor(checkOutTarget._id);
      if (res?.success) {
        showToast(`Visitor ${checkOutTarget.visitorId} CHECKED OUT successfully!`);
        setCheckOutTarget(null);
        fetchVisitorsData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  const tableHeaders = [
    'Visitor ID',
    'Visitor Name & Contact',
    'Company & Purpose',
    'Host Employee',
    'Schedule / Timestamps',
    'ID Proof',
    'Status',
    'Actions',
  ];

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reception Desk - Visitor Portal</h2>
          <p className="text-sm text-gray-500">
            Register visitors, manage live check-ins & check-outs, and monitor visitors inside premises.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedVisitor(null);
            setModalError('');
            setIsVisitorModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Visitor</span>
        </Button>
      </div>

      {/* Toast Notification Banner */}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card
          title="Today's Visitors"
          value={receptionStats ? receptionStats.todayVisitors : pagination.total}
          icon={Users}
        />
        <Card
          title="Pending Approvals"
          value={receptionStats ? receptionStats.pendingApprovals : '--'}
          icon={Clock}
        />
        <Card
          title="Approved Visitors"
          value={receptionStats ? receptionStats.approvedVisitors : '--'}
          icon={CheckCircle2}
        />
        <Card
          title="Currently Inside"
          value={receptionStats ? receptionStats.currentlyInside : '--'}
          icon={LogIn}
        />
        <Card
          title="Today Check-Ins"
          value={receptionStats ? receptionStats.todayCheckIns : '--'}
          icon={UserCheck}
        />
        <Card
          title="Today Check-Outs"
          value={receptionStats ? receptionStats.todayCheckOuts : '--'}
          icon={LogOut}
        />
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('ALL');
            setPage(1);
          }}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'ALL'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Registrations</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('INSIDE');
            setPage(1);
          }}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'INSIDE'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Currently Inside {activeTab === 'INSIDE' && `(${pagination.total})`}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('CHECKINS');
            setPage(1);
          }}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'CHECKINS'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Today's Check-Ins {activeTab === 'CHECKINS' && `(${pagination.total})`}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('CHECKOUTS');
            setPage(1);
          }}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'CHECKOUTS'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Today's Check-Outs {activeTab === 'CHECKOUTS' && `(${pagination.total})`}</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
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

        {/* Filters (Only shown on 'ALL' tab) */}
        {activeTab === 'ALL' && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span>Visit Date:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {dateFilter && (
                <button
                  onClick={() => {
                    setDateFilter('');
                    setPage(1);
                  }}
                  className="text-xs text-sky-600 hover:underline font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span>Host:</span>
              <select
                value={employeeFilter}
                onChange={(e) => {
                  setEmployeeFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">All Employees</option>
                {activeEmployees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="CHECKED_IN">CHECKED_IN</option>
                <option value="CHECKED_OUT">CHECKED_OUT</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Visitor Data Table */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        {isLoading ? (
          <Loader message="Loading visitor logs..." />
        ) : visitors.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-semibold text-gray-700">No Visitors Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No registered visitors match your view tab or search criteria.
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
                  <td className="px-4 py-3 text-xs">
                    {v.employee ? (
                      <span className="font-medium text-gray-800">
                        {v.employee.firstName} {v.employee.lastName}
                        <br />
                        <span className="text-sky-600">({v.employee.employeeCode})</span>
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {v.checkInTime ? (
                      <div>
                        <p className="text-emerald-700 font-semibold">
                          In: {new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {v.checkOutTime && (
                          <p className="text-red-700 font-semibold">
                            Out: {new Date(v.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">
                          {new Date(v.visitDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-gray-400">{v.expectedArrivalTime}</p>
                      </div>
                    )}
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
                          ? 'bg-blue-100 text-blue-800'
                          : v.status === 'CHECKED_IN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'CHECKED_OUT'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* View Details Drawer */}
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

                      {/* CHECK-IN Button (Only for APPROVED status) */}
                      {v.status === 'APPROVED' && (
                        <button
                          onClick={() => setCheckInTarget(v)}
                          title="Check In Visitor"
                          className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Check In</span>
                        </button>
                      )}

                      {/* CHECK-OUT Button (Only for CHECKED_IN status) */}
                      {v.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => setCheckOutTarget(v)}
                          title="Check Out Visitor"
                          className="px-2.5 py-1 bg-red-600 text-white hover:bg-red-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Check Out</span>
                        </button>
                      )}

                      {/* Edit Visitor (Only if PENDING/APPROVED) */}
                      {(v.status === 'PENDING' || v.status === 'APPROVED') && (
                        <button
                          onClick={() => {
                            setSelectedVisitor(v);
                            setModalError('');
                            setIsVisitorModalOpen(true);
                          }}
                          title="Edit Visitor"
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Cancel Registration */}
                      {(v.status === 'PENDING' || v.status === 'APPROVED') && (
                        <button
                          onClick={() => setCancelTarget(v)}
                          title="Cancel Registration"
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
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
                <span className="font-semibold text-gray-800">{pagination.totalPages}</span> ({pagination.total} Total Visitors)
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

      {/* Modals & Drawer */}
      <VisitorModal
        isOpen={isVisitorModalOpen}
        onClose={() => {
          setIsVisitorModalOpen(false);
          setSelectedVisitor(null);
        }}
        onSubmit={selectedVisitor ? handleUpdateVisitor : handleRegisterVisitor}
        initialData={selectedVisitor}
        isSubmitting={isSubmitting}
        error={modalError}
      />

      <VisitorDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedVisitor(null);
        }}
        visitor={selectedVisitor}
      />

      <CancelConfirmModal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        visitor={cancelTarget}
        isCancelling={isActionPending}
      />

      <CheckInModal
        isOpen={Boolean(checkInTarget)}
        onClose={() => setCheckInTarget(null)}
        onConfirm={handleConfirmCheckIn}
        visitor={checkInTarget}
        isSubmitting={isActionPending}
      />

      <CheckOutModal
        isOpen={Boolean(checkOutTarget)}
        onClose={() => setCheckOutTarget(null)}
        onConfirm={handleConfirmCheckOut}
        visitor={checkOutTarget}
        isSubmitting={isActionPending}
      />
    </div>
  );
};

export default ReceptionDashboard;
