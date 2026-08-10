/**
 * Reusable Card Component
 * Purpose: Container card used for metrics, statistics, or grouping form elements.
 */

import React from 'react';

const Card = ({ title, value, icon: Icon, children, className = '' }) => {
  return (
    <div className={`p-3.5 sm:p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow min-w-0 ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-500 truncate" title={title}>{title}</span>
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 shrink-0" />}
        </div>
      )}
      {value !== undefined && value !== null && (
        <div className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{value}</div>
      )}
      {children}
    </div>
  );
};

export default Card;
