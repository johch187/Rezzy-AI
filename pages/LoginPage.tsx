import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import type { Provider } from '@supabase/supabase-js';
import { ProfileContext } from '../App';
import { supabase } from '../services/supabaseClient';

const LoginPage: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!profileContext) {
    return null;
  }

  const { currentUser, authReady, isSupabaseEnabled, signOut, isSyncingProfile } = profileContext;

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || !isSupabaseEnabled || !email) return;

    setIsSubmitting(true);
    setStatusMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${window.location.origin}/`,
        },
    });
    setIsSubmitting(false);

    if (error) {
        setStatusMessage(error.message);
    } else {
        setStatusMessage("Check your inbox for a secure magic link to finish signing in.");
        setEmail('');
    }
  };

  const handleOAuthLogin = async (provider: Provider) => {
    if (!supabase || !isSupabaseEnabled) return;
    try {
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        });
    } catch (error: any) {
        setStatusMessage(error.message ?? "Failed to start OAuth flow. Please try again.");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setStatusMessage(null);
  };

  if (!isSupabaseEnabled) {
    return (
      <div className="bg-white py-16 sm:py-24 animate-fade-in">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl mb-4">Enable Supabase</h1>
          <p className="text-lg text-gray-600">
            This project now expects Supabase credentials. Add <code className="font-mono bg-slate-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-slate-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your Vercel environment (and local <code>.env</code>) to unlock authentication and cloud sync.
          </p>
          <p className="mt-4 text-gray-500">
            Follow the “Deploy to Vercel with Supabase” steps in <code className="font-mono bg-slate-100 px-1 rounded">DEPLOYMENT.md</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <p className="text-slate-600">Checking your session...</p>
      </div>
    );
  }

  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl mb-4 text-center">
            {currentUser ? 'You are signed in' : 'Login or Register'}
          </h1>
          <p className="text-lg text-gray-600 mb-10 text-center">
            {currentUser
              ? 'Your workspace is syncing with Supabase. Jump back into the builder or sign out below.'
              : 'Use a passwordless link or sign in with Google to access your saved profiles anywhere.'}
          </p>

          {currentUser ? (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center space-y-4">
              <p className="text-slate-700">
                Signed in as <span className="font-semibold">{currentUser.email ?? currentUser.user_metadata?.full_name}</span>
              </p>
              {isSyncingProfile && (
                <p className="text-sm text-slate-500">Syncing your latest profile data...</p>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/builder"
                  className="px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
                >
                  Go to Builder
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-3 border border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors w-full sm:w-auto"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <form onSubmit={handleEmailLogin} className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm">
                <label className="block text-left text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 px-4 py-3 bg-brand-blue text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
                >
                  {isSubmitting ? 'Sending magic link...' : 'Send magic link'}
                </button>
              </form>

              <div className="text-center">
                <p className="text-sm text-slate-500 mb-4">Prefer OAuth?</p>
                <button
                  onClick={() => handleOAuthLogin('google')}
                  className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors w-full"
                >
                  Continue with Google
                </button>
              </div>

              {statusMessage && (
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-blue-700 text-sm">
                  {statusMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
