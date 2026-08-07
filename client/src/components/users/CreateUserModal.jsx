/**
 * Create User Modal Component
 * Purpose: Allows Administrators to create user accounts linked to active employees.
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../modal/Modal';
import Input from '../inputs/Input';
import Button from '../buttons/Button';
import { getEmployees } from '../../services/employeeService';
import { ROLES } from '../../constants';

// Zod Schema
const createUserSchema = z.object({
  employeeId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.EMPLOYEE]),
});

const CreateUserModal = ({ isOpen, onClose, onSubmit, isSubmitting, error }) => {
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
    defaultValues: {
      employeeId: '',
      name: '',
      email: '',
      password: '',
      role: ROLES.EMPLOYEE,
    },
  });

  const selectedEmployeeId = watch('employeeId');

  // Fetch active employees when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        employeeId: '',
        name: '',
        email: '',
        password: '',
        role: ROLES.EMPLOYEE,
      });

      const fetchActiveEmployees = async () => {
        setIsLoadingEmployees(true);
        try {
          const res = await getEmployees({ status: 'Active', limit: 100 });
          if (res?.success) {
            setActiveEmployees(res.data.employees);
          }
        } catch (err) {
          console.error('[Fetch Employees Error]:', err.message);
        } finally {
          setIsLoadingEmployees(false);
        }
      };

      fetchActiveEmployees();
    }
  }, [isOpen, reset]);

  // Auto-fill Name & Email when an Employee is selected from dropdown
  useEffect(() => {
    if (selectedEmployeeId) {
      const emp = activeEmployees.find((e) => e._id === selectedEmployeeId);
      if (emp) {
        setValue('name', `${emp.firstName} ${emp.lastName}`);
        setValue('email', emp.email);
      }
    }
  }, [selectedEmployeeId, activeEmployees, setValue]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create User Account">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Employee Link Dropdown */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-gray-700">Link to Employee (Optional)</label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
            {...register('employeeId')}
            disabled={isLoadingEmployees}
          >
            <option value="">-- Standalone User Account --</option>
            {activeEmployees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.employeeCode} - {emp.firstName} {emp.lastName} ({emp.department})
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400">
            Selecting an active employee pre-fills their name & email.
          </span>
        </div>

        <Input
          label="Full Name"
          placeholder="User Full Name"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="user@company.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Initial Password"
          type="password"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-gray-700">System Role</label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
            {...register('role')}
          >
            <option value={ROLES.EMPLOYEE}>EMPLOYEE (View Visitors)</option>
            <option value={ROLES.RECEPTIONIST}>RECEPTIONIST (Pass Generation)</option>
            <option value={ROLES.ADMIN}>ADMIN (Full System Control)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
