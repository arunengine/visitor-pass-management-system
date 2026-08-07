/**
 * Reset User Password Modal Component
 * Purpose: Allows Administrators to reset passwords for user accounts.
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../modal/Modal';
import Input from '../inputs/Input';
import Button from '../buttons/Button';
import { KeyRound } from 'lucide-react';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

const ResetUserPasswordModal = ({ isOpen, onClose, onSubmit, user, isSubmitting, error }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      newPassword: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ newPassword: '' });
    }
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reset Password for ${user?.email}`}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-800 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Enter a new password for user account <strong>{user?.name}</strong>.</span>
        </div>

        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          required
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ResetUserPasswordModal;
