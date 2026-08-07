/**
 * Login Page (Placeholder)
 * Purpose: Authentication portal placeholder for User credentials entry.
 */

import React from 'react';
import Card from '../components/cards/Card';
import Input from '../components/inputs/Input';
import Button from '../components/buttons/Button';
import { ShieldCheck } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl border border-slate-200">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 bg-sky-100 text-sky-600 rounded-full mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Sign In</h2>
          <p className="text-sm text-slate-500 mt-1">
            Visitor Pass Management System
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="admin@example.com"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
          />

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2">
            Sign In (Placeholder)
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
