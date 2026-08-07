/**
 * Add / Edit Employee Modal Component
 * Purpose: Form modal for creating a new employee or updating existing employee details.
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../modal/Modal';
import Input from '../inputs/Input';
import Button from '../buttons/Button';

// Employee Zod Schema
const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  status: z.enum(['Active', 'Inactive']),
});

const EmployeeModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting, error }) => {
  const isEditMode = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      status: 'Active',
    },
  });

  // Populate form fields when editing an existing employee
  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department: initialData.department || '',
        designation: initialData.designation || '',
        status: initialData.status || 'Active',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        status: 'Active',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Employee (${initialData?.employeeCode})` : 'Add New Employee'}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            required
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            required
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="john.doe@company.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone Number"
            placeholder="9876543210"
            required
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Department"
            placeholder="Engineering / HR / Finance"
            required
            error={errors.department?.message}
            {...register('department')}
          />
          <Input
            label="Designation"
            placeholder="Senior Developer"
            required
            error={errors.designation?.message}
            {...register('designation')}
          />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
            {...register('status')}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Employee'
              : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeModal;
