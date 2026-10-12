import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';
import { Layers, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    if (!isSupabaseConfigured) {
      localStorage.setItem('taskflow_demo_mode', 'true');
      success('Logged in successfully in Sandbox Demo mode!');
      window.location.href = '/dashboard';
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setAuthError(error.message);
        toastError(error.message);
      } else {
        success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign in';
      setAuthError(message);
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    localStorage.setItem('taskflow_demo_mode', 'true');
    success('Logged into Sandbox Demo environment!');
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white shadow-md shadow-primary/30 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Welcome back to TASKFLOW
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Plan smarter. Get things done.
          </p>
        </div>

        <div className="bg-surface p-8 rounded-2xl border border-border shadow-card">
          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-danger-light border border-danger/30 text-danger-dark text-xs font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="alex@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Password
                </span>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="md"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-text-secondary font-medium">
                Or explore without Supabase
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full text-xs"
            onClick={handleDemoSignIn}
          >
            Launch Instant Demo Sandbox
          </Button>

          <p className="text-center text-xs text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
