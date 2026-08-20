/**
 * Register / Edit Visitor Modal Component
 * Purpose: Form modal for registering new visitors or editing existing visitor details.
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../modal/Modal';
import Input from '../inputs/Input';
import Button from '../buttons/Button';

// Zod Validation Schema for Visitor Registration
const visitorSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().optional().or(z.literal('')),
  company: z.string().min(1, 'Company name is required'),
  address: z.string().optional(),
  idProofType: z.enum(['Aadhaar', 'PAN Card', 'Driving License', 'Passport', 'Voter ID', 'Other']),
  idProofNumber: z.string().min(1, 'ID Proof number is required'),
  purposeOfVisit: z.string().min(1, 'Purpose of visit is required'),
  visitDate: z.string().min(1, 'Visit date is required'),
  expectedArrivalTime: z.string().min(1, 'Expected arrival time is required'),
  remarks: z.string().optional(),
});

const VisitorModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting, error }) => {
  const isEditMode = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(visitorSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      company: '',
      address: '',
      idProofType: 'Aadhaar',
      idProofNumber: '',
      purposeOfVisit: '',
      visitDate: new Date().toISOString().split('T')[0],
      expectedArrivalTime: '10:00',
      remarks: '',
    },
  });

  // Reset form values when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          fullName: initialData.fullName || '',
          phone: initialData.phone || '',
          email: initialData.email || '',
          company: initialData.company || '',
          address: initialData.address || '',
          idProofType: initialData.idProofType || 'Aadhaar',
          idProofNumber: initialData.idProofNumber || '',
          purposeOfVisit: initialData.purposeOfVisit || '',
          visitDate: initialData.visitDate
            ? new Date(initialData.visitDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          expectedArrivalTime: initialData.expectedArrivalTime || '10:00',
          remarks: initialData.remarks || '',
        });
      } else {
        reset({
          fullName: '',
          phone: '',
          email: '',
          company: '',
          address: '',
          idProofType: 'Aadhaar',
          idProofNumber: '',
          purposeOfVisit: '',
          visitDate: new Date().toISOString().split('T')[0],
          expectedArrivalTime: '10:00',
          remarks: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Visitor Details' : 'Register New Visitor'}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Visitor Full Name"
            placeholder="Rahul Sharma"
            required
            error={errors.fullName?.message}
            {...register('fullName')}
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
            label="Company / Organization"
            placeholder="Tech Corp Ltd"
            required
            error={errors.company?.message}
            {...register('company')}
          />
          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="visitor@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {/* ID Proof & Purpose */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">
              ID Proof Type <span className="text-red-500">*</span>
            </label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
              {...register('idProofType')}
            >
              <option value="Aadhaar">Aadhaar Card</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Driving License">Driving License</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <Input
            label="ID Proof Number"
            placeholder="XXXX-XXXX-XXXX"
            required
            error={errors.idProofNumber?.message}
            {...register('idProofNumber')}
          />
          <Input
            label="Purpose of Visit"
            placeholder="Business Meeting / Interview"
            required
            error={errors.purposeOfVisit?.message}
            {...register('purposeOfVisit')}
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Visit Date"
            type="date"
            required
            error={errors.visitDate?.message}
            {...register('visitDate')}
          />
          <Input
            label="Expected Arrival Time"
            type="time"
            required
            error={errors.expectedArrivalTime?.message}
            {...register('expectedArrivalTime')}
          />
        </div>

        <Input
          label="Remarks / Notes (Optional)"
          placeholder="Additional notes..."
          error={errors.remarks?.message}
          {...register('remarks')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? 'Updating...'
                : 'Registering...'
              : isEditMode
              ? 'Update Visitor'
              : 'Register Visitor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VisitorModal;
