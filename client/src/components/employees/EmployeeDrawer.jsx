/**
 * Employee Details Drawer Component
 * Purpose: Slide-over drawer displaying comprehensive information for a selected employee.
 */

import React from 'react';
import { User, Mail, Phone, Briefcase, Building, Calendar, X, ShieldAlert } from 'lucide-react';

const EmployeeDrawer = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-96 sm:max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="p-2 sm:p-2.5 bg-sky-600 rounded-lg text-white font-bold text-xs sm:text-sm shrink-0">
                {employee.employeeCode}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold leading-tight truncate">
                  {employee.firstName} {employee.lastName}
                </h3>
                <span className="text-xs text-slate-400 block truncate">{employee.designation}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Current Status
              </span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  employee.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {employee.status}
              </span>
            </div>

            {/* Inactive Notice */}
            {employee.status === 'Inactive' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Notice: Inactive employees cannot receive visitors.</span>
              </div>
            )}

            {/* Details List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Personal & Work Details
              </h4>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <User className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Email Address</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Phone Number</p>
                  <p className="font-medium">{employee.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Building className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Briefcase className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Designation</p>
                  <p className="font-medium">{employee.designation}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Created Date</p>
                  <p className="font-medium">
                    {new Date(employee.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDrawer;
