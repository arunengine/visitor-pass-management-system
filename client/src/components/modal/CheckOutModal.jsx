/**
 * Check-Out Confirmation Modal Component
 * Purpose: Confirmation modal for checking out a visitor from the premises.
 */

import React from 'react';
import Modal from './Modal';
import Button from '../buttons/Button';
import { LogOut } from 'lucide-react';

const CheckOutModal = ({ isOpen, onClose, onConfirm, visitor, isSubmitting }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Visitor Check-Out">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-full">
          <LogOut className="w-8 h-8" />
        </div>
        <p className="text-sm text-gray-600">
          Confirm Check-Out for visitor <strong>{visitor?.fullName}</strong> ({visitor?.visitorId})?
          <br />
          <span className="text-xs text-gray-400">
            Checked in at: {visitor?.checkInTime ? new Date(visitor.checkInTime).toLocaleTimeString() : 'N/A'}
          </span>
        </p>
        <div className="flex justify-end gap-3 w-full pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Checking Out...' : 'Confirm Check-Out'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CheckOutModal;
