import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { supabase, isSupabaseEnabled } from '../services/supabaseClient';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    // Redirect if already authenticated
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/builder');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        navigate('/builder');
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!supabase) {
      setErrorMessage('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (format: sb_publishable_...) to your .env.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    setIsSubmitting(true);
    const redirectUrl = `${window.location.origin}/builder`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setStatusMessage('Magic link sent! Check your email to complete sign-in.');
    }
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!supabase) {
      setErrorMessage('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (format: sb_publishable_...) to your .env.');
      return;
    }

    setIsSubmitting(true);
    const redirectUrl = `${window.location.origin}/builder`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    } else {
      setStatusMessage('Redirecting to Google…');
    }
  };

  return (
    <div className="bg-white py-16 sm:py-24 min-h-screen animate-fade-in">
      <Container className="max-w-4xl py-0">
        <div className="max-w-md mx-auto">
          <PageHeader
            title="Login or Register"
            subtitle="Sign in with Supabase to sync your workspace securely."
          />

          {!isSupabaseEnabled && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">
              Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (format: sb_publishable_...) in your .env to enable authentication.
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {statusMessage && (
            <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
              {statusMessage}
            </div>
          )}

          <div className="bg-gray-100 p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="text-left">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  We’ll send you a magic link to sign in or create your account.
                </p>
              </div>

              <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                {isSubmitting ? 'Sending link…' : 'Send magic link'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-100 px-2 text-slate-500">or</span>
              </div>
            </div>

            <Button variant="secondary" fullWidth onClick={handleGoogleLogin} disabled={isSubmitting}>
              {isSubmitting ? 'Redirecting…' : 'Continue with Google'}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;
