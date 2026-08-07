/**
 * Check-In Confirmation Modal Component
 * Purpose: Confirmation modal for checking in an approved visitor into the premises.
 */

import React from 'react';
import Modal from './Modal';
import Button from '../buttons/Button';
import { LogIn } from 'lucide-react';

const CheckInModal = ({ isOpen, onClose, onConfirm, visitor, isSubmitting }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Visitor Check-In">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
          <LogIn className="w-8 h-8" />
        </div>
        <p className="text-sm text-gray-600">
          Confirm Check-In for visitor <strong>{visitor?.fullName}</strong> ({visitor?.visitorId})?
          <br />
          <span className="text-xs text-gray-400">
            Host: {visitor?.employee?.firstName} {visitor?.employee?.lastName} ({visitor?.employee?.department})
          </span>
        </p>
        <div className="flex justify-end gap-3 w-full pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Checking In...' : 'Confirm Check-In'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CheckInModal;
