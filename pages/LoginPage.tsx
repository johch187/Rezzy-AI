import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignInPage } from '../components/ui/sign-in';
import { supabase, isSupabaseEnabled } from '../services/supabaseClient';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get the redirect path from state or default to checking onboarding
  const from = (location.state as any)?.from || null;

  useEffect(() => {
    if (!supabase) return;

    // Check if already authenticated
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        handlePostAuth();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        handlePostAuth();
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const handlePostAuth = () => {
    // Check if this is a new user (needs onboarding)
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    
    if (!onboardingComplete && mode === 'signup') {
      navigate('/onboarding');
    } else if (from) {
      navigate(from);
    } else {
      navigate('/career-coach');
    }
  };

  const handleEmailSignIn = async (email: string, password?: string) => {
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError('Authentication is not configured. Please contact support.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup' && password) {
        // Sign up with email and password
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccess('Check your email to confirm your account.');
        }
      } else {
        // Magic link sign in
        const redirectUrl = `${window.location.origin}${from || '/career-coach'}`;
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (otpError) {
          setError(otpError.message);
        } else {
          setSuccess('Magic link sent! Check your email to sign in.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError('Authentication is not configured. Please contact support.');
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = mode === 'signup'
        ? `${window.location.origin}/onboarding`
        : `${window.location.origin}${from || '/career-coach'}`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setIsLoading(false);
      } else {
        setSuccess('Redirecting to Google...');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError('Authentication is not configured. Please contact support.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess('Password reset email sent. Check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show warning if Supabase is not configured
  if (!isSupabaseEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration Required</h2>
            <p className="text-gray-500 text-sm mb-6">
              Authentication is not configured. Please set up your environment variables:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-600 font-mono">
              <p>VITE_SUPABASE_URL=your_url</p>
              <p>VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SignInPage
      mode={mode}
      onModeChange={setMode}
      onEmailSignIn={handleEmailSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      isLoading={isLoading}
      error={error}
      success={success}
    />
  );
};

export default LoginPage;
