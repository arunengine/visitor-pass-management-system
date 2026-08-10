/**
 * Admin Dashboard Page
 * Purpose: Central control hub for System Administrators featuring tabbed management:
 * 1. Employee Management (View, Add, Edit, Soft Delete, Status Toggle)
 * 2. User Accounts Management (View, Create User linked to Employee, Edit Role/Email, Status Toggle, Reset Password)
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
  Shield,
  KeyRound,
  UserPlus,
  Clock,
  LogIn,
  LogOut,
} from 'lucide-react';

import Card from '../components/cards/Card';
import Table from '../components/tables/Table';
import Button from '../components/buttons/Button';
import Loader from '../components/loader/Loader';
import { useAuth } from '../hooks/useAuth';

// Employee Components
import EmployeeModal from '../components/employees/EmployeeModal';
import EmployeeDrawer from '../components/employees/EmployeeDrawer';
import DeleteConfirmModal from '../components/modal/DeleteConfirmModal';

// User Account Components
import CreateUserModal from '../components/users/CreateUserModal';
import EditUserModal from '../components/users/EditUserModal';
import ResetUserPasswordModal from '../components/users/ResetUserPasswordModal';

// Services
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
} from '../services/employeeService';

import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetPassword,
} from '../services/userService';

import { getAdminDashboardStats } from '../services/dashboardService';

const AdminDashboard = () => {
  const { user: currentLoggedUser } = useAuth();

  // Live Stats State
  const [adminStats, setAdminStats] = useState(null);

  // Active Tab State ('EMPLOYEES' | 'USERS')
  const [activeTab, setActiveTab] = useState('EMPLOYEES');

  // --- EMPLOYEE STATE ---
  const [employees, setEmployees] = useState([]);
  const [empPagination, setEmpPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isEmpLoading, setIsEmpLoading] = useState(true);
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('ALL');
  const [empStatusFilter, setEmpStatusFilter] = useState('ALL');
  const [empPage, setEmpPage] = useState(1);

  // Employee Modals
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isEmpDrawerOpen, setIsEmpDrawerOpen] = useState(false);
  const [deleteEmpTarget, setDeleteEmpTarget] = useState(null);
  const [isEmpSubmitting, setIsEmpSubmitting] = useState(false);
  const [isEmpDeleting, setIsEmpDeleting] = useState(false);
  const [empModalError, setEmpModalError] = useState('');

  // --- USER ACCOUNTS STATE ---
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [userPage, setUserPage] = useState(1);

  // User Modals
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isUserSubmitting, setIsUserSubmitting] = useState(false);
  const [userModalError, setUserModalError] = useState('');

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // --- FETCH EMPLOYEES ---
  const fetchEmployeesData = useCallback(async () => {
    setIsEmpLoading(true);
    try {
      const res = await getEmployees({
        page: empPage,
        limit: 10,
        search: empSearch,
        department: empDeptFilter,
        status: empStatusFilter,
      });
      if (res?.success) {
        setEmployees(res.data.employees);
        setEmpPagination(res.data.pagination);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch employees', 'error');
    } finally {
      setIsEmpLoading(false);
    }
  }, [empPage, empSearch, empDeptFilter, empStatusFilter]);

  // --- FETCH USERS ---
  const fetchUsersData = useCallback(async () => {
    setIsUserLoading(true);
    try {
      const res = await getUsers({
        page: userPage,
        limit: 10,
        search: userSearch,
        role: userRoleFilter,
        status: userStatusFilter,
      });
      if (res?.success) {
        setUsers(res.data.users);
        setUserPagination(res.data.pagination);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      setIsUserLoading(false);
    }
  }, [userPage, userSearch, userRoleFilter, userStatusFilter]);

  useEffect(() => {
    if (activeTab === 'EMPLOYEES') {
      fetchEmployeesData();
    } else {
      fetchUsersData();
    }
  }, [activeTab, fetchEmployeesData, fetchUsersData]);

  // Fetch Admin Live Stats
  const fetchAdminStats = useCallback(async () => {
    try {
      const res = await getAdminDashboardStats();
      if (res?.success) {
        setAdminStats(res.data);
      }
    } catch (err) {
      console.error('[Fetch Admin Stats Error]:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  // --- EMPLOYEE HANDLERS ---
  const handleCreateEmployee = async (data) => {
    setIsEmpSubmitting(true);
    setEmpModalError('');
    try {
      const res = await createEmployee(data);
      if (res?.success) {
        showToast(`Employee ${res.data.employee.employeeCode} created successfully!`);
        setIsAddEmpModalOpen(false);
        fetchEmployeesData();
      }
    } catch (err) {
      setEmpModalError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setIsEmpSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (data) => {
    if (!selectedEmp) return;
    setIsEmpSubmitting(true);
    setEmpModalError('');
    try {
      const res = await updateEmployee(selectedEmp._id, data);
      if (res?.success) {
        showToast(`Employee ${selectedEmp.employeeCode} updated successfully!`);
        setSelectedEmp(null);
        fetchEmployeesData();
      }
    } catch (err) {
      setEmpModalError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setIsEmpSubmitting(false);
    }
  };

  const handleToggleEmpStatus = async (emp) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await updateEmployeeStatus(emp._id, newStatus);
      if (res?.success) {
        showToast(`Employee ${emp.employeeCode} status set to ${newStatus}`);
        fetchEmployeesData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleConfirmDeleteEmp = async () => {
    if (!deleteEmpTarget) return;
    setIsEmpDeleting(true);
    try {
      const res = await deleteEmployee(deleteEmpTarget._id);
      if (res?.success) {
        showToast(`Employee ${deleteEmpTarget.employeeCode} soft-deleted successfully.`);
        setDeleteEmpTarget(null);
        fetchEmployeesData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete employee', 'error');
    } finally {
      setIsEmpDeleting(false);
    }
  };

  // --- USER HANDLERS ---
  const handleCreateUser = async (data) => {
    setIsUserSubmitting(true);
    setUserModalError('');
    try {
      const res = await createUser(data);
      if (res?.success) {
        showToast(`User account created successfully for ${res.data.user.email}!`);
        setIsCreateUserModalOpen(false);
        fetchUsersData();
      }
    } catch (err) {
      setUserModalError(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setIsUserSubmitting(false);
    }
  };

  const handleUpdateUser = async (data) => {
    if (!selectedUser) return;
    setIsUserSubmitting(true);
    setUserModalError('');
    try {
      const res = await updateUser(selectedUser._id, data);
      if (res?.success) {
        showToast(`User ${selectedUser.email} updated successfully!`);
        setIsEditUserModalOpen(false);
        setSelectedUser(null);
        fetchUsersData();
      }
    } catch (err) {
      setUserModalError(err.response?.data?.message || 'Failed to update user account');
    } finally {
      setIsUserSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (userObj) => {
    const newStatus = !userObj.isActive;
    try {
      const res = await toggleUserStatus(userObj._id, newStatus);
      if (res?.success) {
        showToast(`User ${userObj.email} set to ${newStatus ? 'Active' : 'Inactive'}`);
        fetchUsersData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change status', 'error');
    }
  };

  const handleResetPassword = async (data) => {
    if (!selectedUser) return;
    setIsUserSubmitting(true);
    setUserModalError('');
    try {
      const res = await resetPassword(selectedUser._id, data.newPassword);
      if (res?.success) {
        showToast(`Password for ${selectedUser.email} reset successfully!`);
        setIsResetPasswordModalOpen(false);
        setSelectedUser(null);
      }
    } catch (err) {
      setUserModalError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsUserSubmitting(false);
    }
  };

  const empTableHeaders = ['Code', 'Name', 'Email & Phone', 'Department', 'Designation', 'Status', 'Actions'];
  const userTableHeaders = ['User Name', 'Email Address', 'Linked Employee', 'System Role', 'Status', 'Actions'];

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Control Center</h2>
          <p className="text-sm text-gray-500">
            Manage corporate employees and system user access accounts.
          </p>
        </div>

        {/* Dynamic Action Button based on Active Tab */}
        {activeTab === 'EMPLOYEES' ? (
          <Button
            variant="primary"
            onClick={() => {
              setSelectedEmp(null);
              setEmpModalError('');
              setIsAddEmpModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => {
              setUserModalError('');
              setIsCreateUserModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User Account</span>
          </Button>
        )}
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

      {/* Live System Overview Metrics */}
      {adminStats && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Live System Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            <Card title="Total Employees" value={adminStats.totalEmployees} icon={Users} />
            <Card title="Total Users" value={adminStats.totalUserAccounts} icon={Shield} />
            <Card title="Total Visitors" value={adminStats.totalVisitors} icon={UserCheck} />
            <Card title="Pending" value={adminStats.pendingRequests} icon={Clock} />
            <Card title="Approved" value={adminStats.approvedVisitors} icon={CheckCircle2} />
            <Card title="Rejected" value={adminStats.rejectedVisitors} icon={UserX} />
            <Card title="Checked In" value={adminStats.checkedInVisitors} icon={LogIn} />
            <Card title="Inside Premises" value={adminStats.currentlyInside} icon={LogIn} />
            <Card title="Today Visitors" value={adminStats.todayVisitors} icon={Users} />
            <Card title="Today Check-Ins" value={adminStats.todayCheckIns} icon={LogIn} />
            <Card title="Today Check-Outs" value={adminStats.todayCheckOuts} icon={LogOut} />
          </div>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex border-b border-gray-200 overflow-x-auto max-w-full whitespace-nowrap">
        <button
          onClick={() => setActiveTab('EMPLOYEES')}
          className={`py-3 px-4 sm:px-6 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'EMPLOYEES'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Employees ({empPagination.total})</span>
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`py-3 px-4 sm:px-6 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'USERS'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" />
          <span>User Accounts ({userPagination.total})</span>
        </button>
      </div>

      {/* --- TAB 1: EMPLOYEES MANAGEMENT --- */}
      {activeTab === 'EMPLOYEES' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card title="Total Employees" value={empPagination.total} icon={Users} />
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

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Code, Name, Email..."
                value={empSearch}
                onChange={(e) => {
                  setEmpSearch(e.target.value);
                  setEmpPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-gray-500 font-medium">
                <span>Department:</span>
                <select
                  value={empDeptFilter}
                  onChange={(e) => {
                    setEmpDeptFilter(e.target.value);
                    setEmpPage(1);
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

              <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-gray-500 font-medium">
                <span>Status:</span>
                <select
                  value={empStatusFilter}
                  onChange={(e) => {
                    setEmpStatusFilter(e.target.value);
                    setEmpPage(1);
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

          {/* Table */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            {isEmpLoading ? (
              <Loader message="Loading employees data..." />
            ) : employees.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Users className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-semibold text-gray-700">No Employees Found</h3>
              </div>
            ) : (
              <>
                <Table headers={empTableHeaders}>
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => {
                              setSelectedEmp(emp);
                              setIsEmpDrawerOpen(true);
                            }}
                            title="View Details"
                            className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEmp(emp);
                              setEmpModalError('');
                              setIsAddEmpModalOpen(true);
                            }}
                            title="Edit Employee"
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleEmpStatus(emp)}
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
                          <button
                            onClick={() => setDeleteEmpTarget(emp)}
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

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  <div>
                    Showing Page <span className="font-semibold text-gray-800">{empPagination.page}</span> of{' '}
                    <span className="font-semibold text-gray-800">{empPagination.totalPages}</span> ({empPagination.total} Total)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={empPage <= 1}
                      onClick={() => setEmpPage((p) => Math.max(p - 1, 1))}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={empPage >= empPagination.totalPages}
                      onClick={() => setEmpPage((p) => p + 1)}
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
      )}

      {/* --- TAB 2: USER ACCOUNTS MANAGEMENT --- */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card title="Total User Accounts" value={userPagination.total} icon={Shield} />
            <Card
              title="Admin Accounts"
              value={users.filter((u) => u.role === 'ADMIN').length}
              icon={UserCheck}
            />
            <Card
              title="Reception Accounts"
              value={users.filter((u) => u.role === 'RECEPTIONIST').length}
              icon={Building}
            />
            <Card
              title="Employee Accounts"
              value={users.filter((u) => u.role === 'EMPLOYEE').length}
              icon={Users}
            />
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search User by Name, Email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-gray-500 font-medium">
                <span>System Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="RECEPTIONIST">RECEPTIONIST</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                </select>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-gray-500 font-medium">
                <span>Status:</span>
                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    setUserStatusFilter(e.target.value);
                    setUserPage(1);
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

          {/* User Data Table */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            {isUserLoading ? (
              <Loader message="Loading user accounts..." />
            ) : users.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Shield className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-semibold text-gray-700">No User Accounts Found</h3>
              </div>
            ) : (
              <>
                <Table headers={userTableHeaders}>
                  {users.map((u) => {
                    const isSelfAdmin = currentLoggedUser?.id === u._id;
                    return (
                      <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {u.name} {isSelfAdmin && <span className="text-xs text-sky-600 font-normal">(You)</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 font-medium">{u.email}</td>
                        <td className="px-4 py-3 text-xs">
                          {u.employee ? (
                            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-200 font-semibold">
                              {u.employee.employeeCode} - {u.employee.firstName} {u.employee.lastName}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">System Account</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === 'RECEPTIONIST'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                              u.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* Edit User Modal */}
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setUserModalError('');
                                setIsEditUserModalOpen(true);
                              }}
                              title="Edit User Role/Email"
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Reset Password Modal */}
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setUserModalError('');
                                setIsResetPasswordModalOpen(true);
                              }}
                              title="Reset Password"
                              className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Toggle User Active Status */}
                            <button
                              disabled={isSelfAdmin}
                              onClick={() => handleToggleUserStatus(u)}
                              title={
                                isSelfAdmin
                                  ? 'Admin cannot deactivate himself'
                                  : u.isActive
                                  ? 'Deactivate Account'
                                  : 'Activate Account'
                              }
                              className={`p-1.5 rounded transition-colors ${
                                isSelfAdmin
                                  ? 'opacity-30 cursor-not-allowed text-gray-400'
                                  : u.isActive
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-amber-600 hover:bg-amber-50'
                              }`}
                            >
                              {u.isActive ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </Table>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  <div>
                    Showing Page <span className="font-semibold text-gray-800">{userPagination.page}</span> of{' '}
                    <span className="font-semibold text-gray-800">{userPagination.totalPages}</span> ({userPagination.total} Total Users)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={userPage >= userPagination.totalPages}
                      onClick={() => setUserPage((p) => p + 1)}
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
      )}

      {/* EMPLOYEE MODALS & DRAWER */}
      <EmployeeModal
        isOpen={isAddEmpModalOpen}
        onClose={() => {
          setIsAddEmpModalOpen(false);
          setSelectedEmp(null);
        }}
        onSubmit={selectedEmp ? handleUpdateEmployee : handleCreateEmployee}
        initialData={selectedEmp}
        isSubmitting={isEmpSubmitting}
        error={empModalError}
      />

      <EmployeeDrawer
        isOpen={isEmpDrawerOpen}
        onClose={() => {
          setIsEmpDrawerOpen(false);
          setSelectedEmp(null);
        }}
        employee={selectedEmp}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteEmpTarget)}
        onClose={() => setDeleteEmpTarget(null)}
        onConfirm={handleConfirmDeleteEmp}
        isDeleting={isEmpDeleting}
        message={`Are you sure you want to soft-delete employee ${deleteEmpTarget?.firstName} ${deleteEmpTarget?.lastName} (${deleteEmpTarget?.employeeCode})?`}
      />

      {/* USER ACCOUNTS MODALS */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSubmit={handleCreateUser}
        isSubmitting={isUserSubmitting}
        error={userModalError}
      />

      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateUser}
        user={selectedUser}
        isSubmitting={isUserSubmitting}
        error={userModalError}
      />

      <ResetUserPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleResetPassword}
        user={selectedUser}
        isSubmitting={isUserSubmitting}
        error={userModalError}
      />
    </div>
  );
};

export default AdminDashboard;
