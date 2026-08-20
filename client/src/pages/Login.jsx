/**
 * Login Page Component
 * Purpose: Provides login form interface integrated with React Hook Form, Zod validation,
 * and AuthContext login action. Dynamically redirects users based on their assigned role upon successful login.
 */

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { ROUTES, ROLES } from '../constants';
import Card from '../components/cards/Card';
import Input from '../components/inputs/Input';
import Button from '../components/buttons/Button';

// Zod Schema for Login Validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { user, login, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // If user is already logged in, redirect automatically to their dashboard
  if (!isAuthLoading && user) {
    if (user.role === ROLES.ADMIN) return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    if (user.role === ROLES.RECEPTIONIST) return <Navigate to={ROUTES.RECEPTION_DASHBOARD} replace />;
    return <Navigate to={ROUTES.EMPLOYEE_DASHBOARD} replace />;
  }

  // 1-Click Credential Auto-Fill Handler
  const handleAutoFill = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    setServerError('');
  };

  // Handle Form Submission
  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);

    const result = await login(data.email, data.password);
    setIsSubmitting(false);

    if (result?.success && result.user) {
      // Role-Based Navigation after successful login
      const role = result.user.role;
      if (role === ROLES.ADMIN) {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (role === ROLES.RECEPTIONIST) {
        navigate(ROUTES.RECEPTION_DASHBOARD);
      } else {
        navigate(ROUTES.EMPLOYEE_DASHBOARD);
      }
    } else {
      setServerError(result?.error || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-3 sm:p-4">
      <Card className="w-full max-w-md p-5 sm:p-8 bg-white shadow-xl rounded-2xl border border-slate-200">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 bg-sky-100 text-sky-600 rounded-full mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Sign In</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visitor Pass Management System
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password123"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full py-2.5 mt-2"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Interview Quick Auto-Fill Credential Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">1-Click Auto-Fill Demo Credentials:</p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => handleAutoFill('admin@company.com', 'Password123')}
              className="w-full text-left px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-md border border-sky-200 transition-colors flex justify-between items-center gap-2 min-w-0"
            >
              <span className="truncate min-w-0">👑 <strong>Admin:</strong> admin@company.com</span>
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border text-[11px] shrink-0">Auto-Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('reception@company.com', 'Password123')}
              className="w-full text-left px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200 transition-colors flex justify-between items-center gap-2 min-w-0"
            >
              <span className="truncate min-w-0">📋 <strong>Receptionist:</strong> reception@company.com</span>
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border text-[11px] shrink-0">Auto-Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('ananya.sen@company.com', 'Password123')}
              className="w-full text-left px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-md border border-purple-200 transition-colors flex justify-between items-center gap-2 min-w-0"
            >
              <span className="truncate min-w-0">💼 <strong>Emp (Ananya Sen / EMP002):</strong> ananya.sen@company.com</span>
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border text-[11px] shrink-0">Auto-Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('rajesh.kumar@company.com', 'Password123')}
              className="w-full text-left px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-md border border-purple-200 transition-colors flex justify-between items-center gap-2 min-w-0"
            >
              <span className="truncate min-w-0">💼 <strong>Emp (Rajesh Kumar / EMP001):</strong> rajesh.kumar@company.com</span>
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border text-[11px] shrink-0">Auto-Fill</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
