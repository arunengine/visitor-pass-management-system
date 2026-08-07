/**
 * Reports Page Component
 * Purpose: Analytics dashboard allowing Administrators and Receptionists to generate visitor reports
 * for presets (Today, This Week, This Month, Custom Date Range), view department breakdown & top hosts,
 * filter detailed visitor logs, and export reports as CSV files.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Search,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  LogIn,
  LogOut,
  Building,
  Award,
} from 'lucide-react';

import Card from '../components/cards/Card';
import Table from '../components/tables/Table';
import Button from '../components/buttons/Button';
import Loader from '../components/loader/Loader';

import { getReportSummary, getReportVisitors } from '../services/reportService';

const Reports = () => {
  // Preset Range state: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM'
  const [rangePreset, setRangePreset] = useState('THIS_MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Summary Analytics State
  const [summaryData, setSummaryData] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  // Visitors Table State
  const [visitors, setVisitors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isVisitorsLoading, setIsVisitorsLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Fetch Summary Analytics
  const fetchSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const res = await getReportSummary({
        range: rangePreset,
        startDate: rangePreset === 'CUSTOM' ? startDate : undefined,
        endDate: rangePreset === 'CUSTOM' ? endDate : undefined,
      });

      if (res?.success) {
        setSummaryData(res.data);
      }
    } catch (err) {
      console.error('[Fetch Report Summary Error]:', err.message);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [rangePreset, startDate, endDate]);

  // Fetch Visitors Log
  const fetchReportVisitorsLog = useCallback(async () => {
    setIsVisitorsLoading(true);
    try {
      const res = await getReportVisitors({
        range: rangePreset,
        startDate: rangePreset === 'CUSTOM' ? startDate : undefined,
        endDate: rangePreset === 'CUSTOM' ? endDate : undefined,
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      });

      if (res?.success) {
        setVisitors(res.data.visitors);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('[Fetch Report Visitors Error]:', err.message);
    } finally {
      setIsVisitorsLoading(false);
    }
  }, [rangePreset, startDate, endDate, page, searchTerm, statusFilter]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchReportVisitorsLog();
  }, [fetchReportVisitorsLog]);

  // Client-side CSV Export Generator
  const handleExportCSV = () => {
    if (!visitors || visitors.length === 0) return;

    const headers = [
      'Visitor ID',
      'Full Name',
      'Phone',
      'Email',
      'Company',
      'Host Employee Code',
      'Host Employee Name',
      'Visit Date',
      'Arrival Time',
      'ID Proof Type',
      'ID Proof Number',
      'Status',
    ];

    const csvRows = [headers.join(',')];

    visitors.forEach((v) => {
      const row = [
        `"${v.visitorId || ''}"`,
        `"${v.fullName || ''}"`,
        `"${v.phone || ''}"`,
        `"${v.email || ''}"`,
        `"${v.company || ''}"`,
        `"${v.employee?.employeeCode || ''}"`,
        `"${v.employee ? `${v.employee.firstName} ${v.employee.lastName}` : ''}"`,
        `"${v.visitDate ? new Date(v.visitDate).toISOString().split('T')[0] : ''}"`,
        `"${v.expectedArrivalTime || ''}"`,
        `"${v.idProofType || ''}"`,
        `"${v.idProofNumber || ''}"`,
        `"${v.status || ''}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `visitor_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tableHeaders = [
    'Visitor ID',
    'Visitor Name & Contact',
    'Company',
    'Host Employee',
    'Visit Date',
    'ID Proof',
    'Status',
  ];

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Reports & Analytics</h2>
          <p className="text-sm text-gray-500">
            Generate statistical reports, analyze department visits, and export visitor records.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleExportCSV}
          disabled={visitors.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Preset Controls & Date Range Picker */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Preset Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => {
              setRangePreset('TODAY');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rangePreset === 'TODAY'
                ? 'bg-sky-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => {
              setRangePreset('THIS_WEEK');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rangePreset === 'THIS_WEEK'
                ? 'bg-sky-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => {
              setRangePreset('THIS_MONTH');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rangePreset === 'THIS_MONTH'
                ? 'bg-sky-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => {
              setRangePreset('CUSTOM');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rangePreset === 'CUSTOM'
                ? 'bg-sky-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom Range
          </button>
        </div>

        {/* Custom Range Inputs */}
        {rangePreset === 'CUSTOM' && (
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <span>Start:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span>End:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics Grid */}
      {isSummaryLoading ? (
        <Loader message="Aggregating report analytics..." />
      ) : summaryData?.stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Visitors" value={summaryData.stats.totalVisitors} icon={Users} />
          <Card title="Approved Visits" value={summaryData.stats.approvedCount} icon={CheckCircle2} />
          <Card title="Rejected Visits" value={summaryData.stats.rejectedCount} icon={XCircle} />
          <Card title="Pending Visits" value={summaryData.stats.pendingCount} icon={Clock} />
          <Card title="Checked In" value={summaryData.stats.checkedInCount} icon={LogIn} />
          <Card title="Checked Out" value={summaryData.stats.checkedOutCount} icon={LogOut} />
          <Card title="Cancelled" value={summaryData.stats.cancelledCount} icon={XCircle} />
        </div>
      ) : null}

      {/* Aggregation Analytics Panels */}
      {!isSummaryLoading && summaryData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Breakdown Table */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <Building className="w-4 h-4 text-sky-600" />
              <span>Department-Wise Visitor Breakdown</span>
            </div>

            {summaryData.departmentBreakdown?.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">No department breakdown data for selected range.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {summaryData.departmentBreakdown.map((dept, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{dept._id || 'General'}</span>
                    <span className="px-2.5 py-0.5 bg-sky-100 text-sky-700 rounded-full font-bold text-xs">
                      {dept.totalVisitors} Visitors
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Most Visited Employees */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Most Visited Employees</span>
            </div>

            {summaryData.mostVisitedEmployees?.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">No host employee visit data for selected range.</p>
            ) : (
              <div className="space-y-2">
                {summaryData.mostVisitedEmployees.map((emp, idx) => (
                  <div
                    key={emp._id}
                    className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {emp.name} <span className="text-sky-600">({emp.employeeCode})</span>
                      </p>
                      <p className="text-gray-400">{emp.department}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">
                      {emp.visitCount} Visits
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filterable Visitor Log Table */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Detailed Visitor Log</h3>

          {/* Table Search & Status Filter */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Visitor, Host..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
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

        {isVisitorsLoading ? (
          <Loader message="Loading visitor log records..." />
        ) : visitors.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500 font-medium">No Report Records Found</p>
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
                  <td className="px-4 py-3 text-xs font-semibold text-gray-700">{v.company}</td>
                  <td className="px-4 py-3 text-xs">
                    {v.employee ? (
                      <span className="font-medium text-gray-800">
                        {v.employee.firstName} {v.employee.lastName} ({v.employee.employeeCode})
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {v.visitDate ? new Date(v.visitDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {v.idProofType} ({v.idProofNumber})
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
                </tr>
              ))}
            </Table>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div>
                Showing Page <span className="font-semibold text-gray-800">{pagination.page}</span> of{' '}
                <span className="font-semibold text-gray-800">{pagination.totalPages}</span> ({pagination.total} Total)
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

export default Reports;
