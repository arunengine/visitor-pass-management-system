/**
 * Approval / Rejection Modal Component
 * Purpose: Allows host employees to approve or reject pending visitor requests with optional remarks.
 */

import React, { useState, useEffect } from 'react';
import Modal from '../modal/Modal';
import Button from '../buttons/Button';
import { CheckCircle2, XCircle } from 'lucide-react';

const ApprovalModal = ({ isOpen, onClose, onConfirm, visitor, actionType, isSubmitting, error }) => {
  const [remarks, setRemarks] = useState('');
  const isApprove = actionType === 'APPROVE';

  useEffect(() => {
    if (isOpen) {
      setRemarks('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(remarks);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isApprove ? `Approve Visitor (${visitor?.visitorId})` : `Reject Visitor (${visitor?.visitorId})`}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${
            isApprove
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {isApprove ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
          )}
          <div>
            <p className="font-bold">{visitor?.fullName} ({visitor?.company})</p>
            <p className="text-xs opacity-90">
              Purpose: {visitor?.purposeOfVisit} | Date: {visitor?.visitDate ? new Date(visitor.visitDate).toLocaleDateString() : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-gray-700">
            {isApprove ? 'Approval Remarks (Optional)' : 'Rejection Reason / Remarks (Optional)'}
          </label>
          <textarea
            rows="3"
            placeholder={
              isApprove
                ? 'Add any instructions for reception or visitor...'
                : 'Reason for declining meeting request...'
            }
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isApprove ? 'primary' : 'danger'}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isApprove
                ? 'Approving...'
                : 'Rejecting...'
              : isApprove
              ? 'Approve Request'
              : 'Reject Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApprovalModal;
