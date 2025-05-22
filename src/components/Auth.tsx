'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?type=reset-password`,
        });
        if (error) throw error;
        setMessage('Check your email for the password reset link');
      } else if (isSignUp) {
        console.log('Starting sign up process...');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=/`,
            data: {
              full_name: '',
              location: '',
              phone: '',
            },
          },
        });
        
        console.log('Sign up response:', { data, error });
        
        if (error) throw error;
        
        if (data.user) {
          console.log('User created:', data.user);
          // Always redirect to profile completion for new sign-ups
          if (data.session) {
            console.log('Session exists, redirecting to profile completion');
            router.push('/profile/complete');
          } else {
            console.log('No session, email confirmation required');
            setMessage('Please check your email for the confirmation link. After confirming your email, you will be redirected to complete your profile setup.');
            // Clear the form
            setEmail('');
            setPassword('');
            setIsSignUp(false);
          }
        }
      } else {
        console.log('Starting sign in process...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log('Sign in response:', { data, error });
        
        if (error) throw error;
        
        if (data.session) {
          console.log('Session exists, checking profile');
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profile) {
            console.log('Profile exists, redirecting to home');
            // Get the stored path or default to home
            const redirectPath = localStorage.getItem('redirectPath') || '/';
            localStorage.removeItem('redirectPath');
            router.push(redirectPath);
          } else {
            console.log('No profile, redirecting to profile completion');
            router.push('/profile/complete');
          }
        }
      }
    } catch (err) {
      console.error('Error during auth:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isResetPassword
              ? 'Reset Password'
              : isSignUp
              ? 'Create Account'
              : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {!isResetPassword && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center">{error}</div>
          )}

          {message && (
            <div className="text-green-600 dark:text-green-400 text-sm text-center">{message}</div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isResetPassword ? (
                'Send Reset Link'
              ) : isSignUp ? (
                'Sign Up'
              ) : (
                'Sign In'
              )}
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue with Google
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsResetPassword(false);
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                }}
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </button>
            </div>
            {!isSignUp && !isResetPassword && (
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setIsResetPassword(true)}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 