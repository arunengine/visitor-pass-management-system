/**
 * Admin Dashboard Page
 * Purpose: Provides System Administrators with complete Employee Management features:
 * View Employees (Search, Filter by Department/Status, Pagination), Add, Edit, Activate/Deactivate,
 * Soft Delete, and view employee details drawer.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Building,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import Card from '../components/cards/Card';
import Table from '../components/tables/Table';
import Button from '../components/buttons/Button';
import Loader from '../components/loader/Loader';
import EmployeeModal from '../components/employees/EmployeeModal';
import EmployeeDrawer from '../components/employees/EmployeeDrawer';
import DeleteConfirmModal from '../components/modal/DeleteConfirmModal';

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
} from '../services/employeeService';

const AdminDashboard = () => {
  // State variables for data & pagination
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Modals & Drawer States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // For Edit or View
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // Employee to delete

  // Action Pending States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Toast Notification Message
  const [toast, setToast] = useState(null); // { type: 'success'|'error', text: '' }

  const showToast = (text, type = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Employees from API
  const fetchEmployeesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getEmployees({
        page,
        limit: 10,
        search: searchTerm,
        department: departmentFilter,
        status: statusFilter,
      });

      if (response?.success) {
        setEmployees(response.data.employees);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch employees', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchEmployeesData();
  }, [fetchEmployeesData]);

  // Handle Add Employee Submission
  const handleCreateEmployee = async (data) => {
    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await createEmployee(data);
      if (res?.success) {
        showToast(`Employee ${res.data.employee.employeeCode} created successfully!`);
        setIsAddModalOpen(false);
        fetchEmployeesData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Employee Submission
  const handleUpdateEmployee = async (data) => {
    if (!selectedEmployee) return;
    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await updateEmployee(selectedEmployee._id, data);
      if (res?.success) {
        showToast(`Employee ${selectedEmployee.employeeCode} updated successfully!`);
        setSelectedEmployee(null);
        fetchEmployeesData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Toggle Active/Inactive Status
  const handleToggleStatus = async (employee) => {
    const newStatus = employee.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await updateEmployeeStatus(employee._id, newStatus);
      if (res?.success) {
        showToast(`Employee ${employee.employeeCode} status set to ${newStatus}`);
        fetchEmployeesData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  // Handle Soft Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteEmployee(deleteTarget._id);
      if (res?.success) {
        showToast(`Employee ${deleteTarget.employeeCode} soft-deleted successfully.`);
        setDeleteTarget(null);
        fetchEmployeesData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete employee', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const tableHeaders = [
    'Code',
    'Name',
    'Email & Phone',
    'Department',
    'Designation',
    'Status',
    'Actions',
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
          <p className="text-sm text-gray-500">
            View, add, update, filter, and soft-delete corporate employees.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedEmployee(null);
            setModalError('');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Employees" value={pagination.total} icon={Users} />
        <Card
          title="Active Status"
          value={employees.filter((e) => e.status === 'Active').length}
          icon={UserCheck}
        />
        <Card
          title="Inactive Status"
          value={employees.filter((e) => e.status === 'Inactive').length}
          icon={UserX}
        />
        <Card
          title="Departments"
          value={Array.from(new Set(employees.map((e) => e.department))).length}
          icon={Building}
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Code, Name, Email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span>Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Marketing">Marketing</option>
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        {isLoading ? (
          <Loader message="Loading employees data..." />
        ) : employees.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Users className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-semibold text-gray-700">No Employees Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No employee records match your search criteria. Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <>
            <Table headers={tableHeaders}>
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-sky-700">{emp.employeeCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-700">{emp.email}</p>
                    <p className="text-xs text-gray-400">{emp.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 font-medium">{emp.department}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{emp.designation}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                        emp.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* View Drawer */}
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setIsDrawerOpen(true);
                        }}
                        title="View Details"
                        className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Modal */}
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setModalError('');
                          setIsAddModalOpen(true);
                        }}
                        title="Edit Employee"
                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Toggle Status */}
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        title={emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded transition-colors ${
                          emp.status === 'Active'
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        {emp.status === 'Active' ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>

                      {/* Soft Delete */}
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        title="Soft Delete"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div>
                Showing Page <span className="font-semibold text-gray-800">{pagination.page}</span> of{' '}
                <span className="font-semibold text-gray-800">{pagination.totalPages}</span> ({pagination.total} Total Employees)
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

      {/* Add / Edit Modal */}
      <EmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={selectedEmployee ? handleUpdateEmployee : handleCreateEmployee}
        initialData={selectedEmployee}
        isSubmitting={isSubmitting}
        error={modalError}
      />

      {/* Employee Details Drawer */}
      <EmployeeDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        message={`Are you sure you want to soft-delete employee ${deleteTarget?.firstName} ${deleteTarget?.lastName} (${deleteTarget?.employeeCode})?`}
      />
    </div>
  );
};

export default AdminDashboard;
