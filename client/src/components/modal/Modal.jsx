/**
 * Reusable Modal Component
 * Purpose: Overlay modal wrapper for forms, view details, and confirmations.
 */

import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in my-auto max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate pr-2" title={title}>{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold shrink-0 p-1"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
