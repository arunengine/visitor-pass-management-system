/**
 * Delete Confirmation Modal
 * Purpose: Warning modal for confirming soft-deletion of an employee record.
 */

import React from 'react';
import Modal from './Modal';
import Button from '../buttons/Button';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDeleting }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Deletion'}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-full">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <p className="text-sm text-gray-600">
          {message || 'Are you sure you want to delete this record? This action will soft-delete the employee.'}
        </p>
        <div className="flex justify-end gap-3 w-full pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Employee'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
