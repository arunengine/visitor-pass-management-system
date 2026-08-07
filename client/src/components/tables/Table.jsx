/**
 * Reusable Table Component
 * Purpose: Generic responsive data table for displaying records (Visitors, Users, Passes).
 */

import React from 'react';

const Table = ({ headers = [], children }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left">
        <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-gray-800">{children}</tbody>
      </table>
    </div>
  );
};

export default Table;
