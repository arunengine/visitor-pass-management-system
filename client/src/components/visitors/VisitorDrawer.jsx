/**
 * Visitor Details Drawer Component
 * Purpose: Slide-over drawer displaying full details of a registered visitor.
 */

import React from 'react';
import { User, Phone, Mail, Building, CreditCard, Calendar, Clock, FileText, X } from 'lucide-react';

const VisitorDrawer = ({ isOpen, onClose, visitor }) => {
  if (!isOpen || !visitor) return null;

  const formattedDate = visitor.visitDate
    ? new Date(visitor.visitDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-96 sm:max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="p-2 sm:p-2.5 bg-sky-600 rounded-lg text-white font-bold text-xs sm:text-sm shrink-0">
                {visitor.visitorId}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold leading-tight truncate">{visitor.fullName}</h3>
                <span className="text-xs text-slate-400 block truncate">{visitor.company}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Registration Status
              </span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  visitor.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : visitor.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-700'
                    : visitor.status === 'CHECKED_OUT'
                    ? 'bg-indigo-100 text-indigo-700'
                    : visitor.status === 'CHECKED_IN'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {visitor.status}
              </span>
            </div>

            {/* Auto Checkout Alert */}
            {visitor.status === 'CHECKED_OUT' && visitor.meetingExpiryTime && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                ⚡ Visitor automatically checked out after meeting duration expired.
              </div>
            )}

            {/* Visitor Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Visitor Information
              </h4>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <User className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="font-medium">{visitor.fullName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Phone Number</p>
                  <p className="font-medium">{visitor.phone}</p>
                </div>
              </div>

              {visitor.email && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="font-medium">{visitor.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Building className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Company / Organization</p>
                  <p className="font-medium">{visitor.company}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CreditCard className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">ID Proof</p>
                  <p className="font-medium">
                    {visitor.idProofType} ({visitor.idProofNumber})
                  </p>
                </div>
              </div>
            </div>

            {/* Visit Schedule */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Visit Schedule & Host
              </h4>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <User className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Host Employee</p>
                  <p className="font-medium">
                    {visitor.employee
                      ? `${visitor.employee.firstName} ${visitor.employee.lastName} (${visitor.employee.employeeCode} - ${visitor.employee.department})`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Scheduled Visit Date</p>
                  <p className="font-medium">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Expected Arrival Time</p>
                  <p className="font-medium">{visitor.expectedArrivalTime}</p>
                </div>
              </div>

              {visitor.meetingStartTime && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Meeting Start Time</p>
                    <p className="font-medium">
                      {new Date(visitor.meetingStartTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {visitor.meetingDuration && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Meeting Duration</p>
                    <p className="font-medium">{visitor.meetingDuration} minutes</p>
                  </div>
                </div>
              )}

              {visitor.meetingExpiryTime && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Expected Checkout / Expiry Time</p>
                    <p className="font-medium text-amber-700">
                      {new Date(visitor.meetingExpiryTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {visitor.checkInTime && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Check-In Time</p>
                    <p className="font-medium text-emerald-700">
                      {new Date(visitor.checkInTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {visitor.checkOutTime && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Check-Out Time</p>
                    <p className="font-medium text-red-700">
                      {new Date(visitor.checkOutTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Purpose of Visit</p>
                  <p className="font-medium">{visitor.purposeOfVisit}</p>
                </div>
              </div>

              {visitor.remarks && (
                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-100">
                  <span className="font-semibold text-gray-700">Remarks:</span> {visitor.remarks}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
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

export default VisitorDrawer;
