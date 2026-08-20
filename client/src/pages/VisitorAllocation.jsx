/**
 * Visitor Allocation Page Component
 * Purpose: Allows Receptionists and System Administrators to view unallocated pending visitors,
 * monitor employee visitor capacity & availability, and allocate visitors manually or dynamically.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, UserPlus, AlertCircle, CheckCircle2, RefreshCw, Zap, ShieldAlert, ArrowRight } from 'lucide-react';
import Table from '../components/tables/Table';
import Button from '../components/buttons/Button';
import Card from '../components/cards/Card';
import Loader from '../components/loader/Loader';
import Modal from '../components/modal/Modal';

import {
  getUnallocatedVisitors,
  allocateVisitor,
  allocateDynamic,
} from '../services/visitorService';
import { getEmployeeCapacity } from '../services/employeeService';

const VisitorAllocation = () => {
  const [unallocatedVisitors, setUnallocatedVisitors] = useState([]);
  const [employeeCapacities, setEmployeeCapacities] = useState([]);
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(true);
  const [isLoadingCapacities, setIsLoadingCapacities] = useState(true);

  // Allocation Modal State
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [isAllocating, setIsAllocating] = useState(false);
  const [modalError, setModalError] = useState('');

  // Dynamic Allocation State
  const [isDynamicAllocating, setIsDynamicAllocating] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Unallocated Visitors
  const fetchUnallocatedData = useCallback(async () => {
    setIsLoadingVisitors(true);
    try {
      const res = await getUnallocatedVisitors();
      if (res?.success) {
        setUnallocatedVisitors(res.data.visitors);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch unallocated visitors', 'error');
    } finally {
      setIsLoadingVisitors(false);
    }
  }, []);

  // Fetch Employee Capacity Metrics
  const fetchCapacityData = useCallback(async () => {
    setIsLoadingCapacities(true);
    try {
      const res = await getEmployeeCapacity();
      if (res?.success) {
        setEmployeeCapacities(res.data.employees);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch employee capacities', 'error');
    } finally {
      setIsLoadingCapacities(false);
    }
  }, []);

  const refreshAllData = useCallback(() => {
    fetchUnallocatedData();
    fetchCapacityData();
  }, [fetchUnallocatedData, fetchCapacityData]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handle Manual Single Visitor Allocation
  const handleConfirmAllocate = async (e) => {
    e.preventDefault();
    if (!selectedVisitor || !selectedEmployeeId) {
      setModalError('Please select an eligible employee for allocation');
      return;
    }

    setIsAllocating(true);
    setModalError('');
    try {
      const res = await allocateVisitor(selectedVisitor._id, selectedEmployeeId);
      if (res?.success) {
        showToast(`Visitor ${selectedVisitor.visitorId} allocated successfully!`);
        setSelectedVisitor(null);
        setSelectedEmployeeId('');
        refreshAllData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to allocate visitor');
    } finally {
      setIsAllocating(false);
    }
  };

  // Handle Dynamic Allocation across all available employees
  const handleDynamicAllocation = async () => {
    setIsDynamicAllocating(true);
    try {
      const res = await allocateDynamic();
      if (res?.success) {
        showToast(res.message || 'Dynamic allocation completed!');
        refreshAllData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Dynamic allocation failed', 'error');
    } finally {
      setIsDynamicAllocating(false);
    }
  };

  const visitorTableHeaders = ['Visitor Details', 'Company', 'Purpose of Visit', 'Scheduled Arrival', 'Status', 'Action'];
  const employeeTableHeaders = ['Employee Code & Name', 'Department', 'Designation', 'Current Visitors', 'Max Capacity', 'Remaining', 'Availability Status'];

  const eligibleEmployees = employeeCapacities.filter((e) => e.isAvailable);

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Visitor Allocation Portal</h2>
          <p className="text-sm text-gray-500">
            Allocate unassigned pending visitors to eligible corporate host employees based on live capacity metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={refreshAllData}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            onClick={handleDynamicAllocation}
            disabled={isDynamicAllocating || unallocatedVisitors.length === 0 || eligibleEmployees.length === 0}
            className="flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>{isDynamicAllocating ? 'Allocating...' : 'Allocate Dynamically'}</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card
          title="Unallocated Visitors"
          value={unallocatedVisitors.length}
          icon={UserPlus}
        />
        <Card
          title="Available Employees"
          value={eligibleEmployees.length}
          icon={UserCheck}
        />
        <Card
          title="Total Employees"
          value={employeeCapacities.length}
          icon={Users}
        />
        <Card
          title="Full Capacity Employees"
          value={employeeCapacities.filter((e) => !e.isAvailable && e.status === 'Active').length}
          icon={ShieldAlert}
        />
      </div>

      {/* SECTION 1: Pending Unallocated Visitors */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            <span>Pending Visitors Awaiting Employee Allocation</span>
            <span className="px-2.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full font-semibold">
              {unallocatedVisitors.length} Pending
            </span>
          </h3>
        </div>

        {isLoadingVisitors ? (
          <Loader message="Loading unallocated visitors..." />
        ) : unallocatedVisitors.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            🎉 All registered pending visitors have been allocated!
          </div>
        ) : (
          <Table headers={visitorTableHeaders}>
            {unallocatedVisitors.map((visitor) => (
              <tr key={visitor._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-xs">
                  <p className="font-bold text-sky-700">{visitor.visitorId}</p>
                  <p className="font-semibold text-gray-800">{visitor.fullName}</p>
                  <p className="text-gray-400">{visitor.phone}</p>
                </td>
                <td className="px-4 py-3 text-xs font-medium text-gray-700">{visitor.company}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{visitor.purposeOfVisit}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {visitor.visitDate ? new Date(visitor.visitDate).toLocaleDateString() : ''} at {visitor.expectedArrivalTime}
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">
                    UNALLOCATED
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedVisitor(visitor);
                      setSelectedEmployeeId('');
                      setModalError('');
                    }}
                    className="px-3 py-1 text-xs"
                  >
                    Allocate Host
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* SECTION 2: Employee Capacity & Availability */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-600" />
            <span>Employee Availability & Capacity Overview</span>
          </h3>
        </div>

        {isLoadingCapacities ? (
          <Loader message="Loading employee capacity data..." />
        ) : employeeCapacities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No employees found.</div>
        ) : (
          <Table headers={employeeTableHeaders}>
            {employeeCapacities.map((emp) => (
              <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-xs">
                  <p className="font-bold text-sky-700">{emp.employeeCode}</p>
                  <p className="font-semibold text-gray-800">{emp.fullName}</p>
                  <p className="text-gray-400">{emp.email}</p>
                </td>
                <td className="px-4 py-3 text-xs font-medium text-gray-700">{emp.department}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{emp.designation}</td>
                <td className="px-4 py-3 text-xs font-bold text-gray-800">{emp.currentVisitors}</td>
                <td className="px-4 py-3 text-xs font-bold text-gray-600">{emp.maxVisitorCapacity}</td>
                <td className="px-4 py-3 text-xs font-bold text-emerald-700">{emp.remainingCapacity}</td>
                <td className="px-4 py-3 text-xs">
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold ${
                      emp.status === 'Inactive'
                        ? 'bg-gray-100 text-gray-600'
                        : emp.isAvailable
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {emp.status === 'Inactive'
                      ? 'INACTIVE'
                      : emp.isAvailable
                      ? 'ELIGIBLE'
                      : 'FULL CAPACITY'}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Manual Allocation Modal */}
      <Modal
        isOpen={Boolean(selectedVisitor)}
        onClose={() => setSelectedVisitor(null)}
        title={`Allocate Host for Visitor (${selectedVisitor?.visitorId})`}
      >
        {modalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {modalError}
          </div>
        )}

        <form onSubmit={handleConfirmAllocate} className="space-y-4">
          <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl space-y-1 text-xs">
            <p className="font-bold text-sky-900 text-sm">{selectedVisitor?.fullName}</p>
            <p className="text-sky-700">Company: {selectedVisitor?.company} | Phone: {selectedVisitor?.phone}</p>
            <p className="text-sky-700">Purpose: {selectedVisitor?.purposeOfVisit}</p>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">
              Select Eligible Host Employee <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white font-medium"
            >
              <option value="">-- Choose Eligible Employee --</option>
              {eligibleEmployees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.employeeCode} - {emp.department}) | Available Capacity: {emp.remainingCapacity}
                </option>
              ))}
            </select>
            {eligibleEmployees.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ No eligible employees currently available. All employees are either inactive or at full capacity.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelectedVisitor(null)}
              disabled={isAllocating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isAllocating || !selectedEmployeeId}
            >
              {isAllocating ? 'Allocating...' : 'Confirm Allocation'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VisitorAllocation;
