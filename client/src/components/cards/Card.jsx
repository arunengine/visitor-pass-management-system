/**
 * Reusable Card Component
 * Purpose: Container card used for metrics, statistics, or grouping form elements.
 */

import React from 'react';

const Card = ({ title, value, icon: Icon, children, className = '' }) => {
  return (
    <div className={`p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          {Icon && <Icon className="w-5 h-5 text-sky-600" />}
        </div>
      )}
      {value && <div className="text-2xl font-bold text-gray-900">{value}</div>}
      {children}
    </div>
  );
};

export default Card;
