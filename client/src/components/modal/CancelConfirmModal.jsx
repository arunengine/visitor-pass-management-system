/**
 * Cancel Confirmation Modal Component
 * Purpose: Confirmation modal for cancelling a pending visitor registration.
 */

import React from 'react';
import Modal from './Modal';
import Button from '../buttons/Button';
import { AlertCircle } from 'lucide-react';

const CancelConfirmModal = ({ isOpen, onClose, onConfirm, visitor, isCancelling }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Visitor Registration">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel visitor registration for{' '}
          <strong>{visitor?.fullName}</strong> ({visitor?.visitorId})?
        </p>
        <div className="flex justify-end gap-3 w-full pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isCancelling}>
            Go Back
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isCancelling}>
            {isCancelling ? 'Cancelling...' : 'Cancel Registration'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelConfirmModal;
