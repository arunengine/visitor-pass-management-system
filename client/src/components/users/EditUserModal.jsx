/**
 * Edit User Modal Component
 * Purpose: Allows Administrators to edit existing User account details (Name, Email, Role).
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../modal/Modal';
import Input from '../inputs/Input';
import Button from '../buttons/Button';
import { ROLES } from '../../constants';

const editUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.enum([ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.EMPLOYEE]),
});

const EditUserModal = ({ isOpen, onClose, onSubmit, user, isSubmitting, error }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editUserSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      role: ROLES.EMPLOYEE,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        role: user.role || ROLES.EMPLOYEE,
      });
    }
  }, [user, reset, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit User Account (${user?.email})`}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Full Name"
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
            {isSubmitting ? 'Updating...' : 'Update Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
