/**
 * Reusable Input Component
 * Purpose: Form input field with label and error handling display.
 */

import React from 'react';

const Input = React.forwardRef(
  (
    {
      label,
      type = 'text',
      name,
      placeholder,
      error,
      required = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-1 w-full ${className}`}>
        {label && (
          <label htmlFor={name} className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          {...rest}
          className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
            error ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'
          }`}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
