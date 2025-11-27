import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- ICONS ---

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.801 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const KejuLogo = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
    <path d="M24 14L32.66 19V29L24 34L15.34 29V19L24 14Z" stroke="#0d0d0d" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M32.66 19C37 16 43 19 43 26" stroke="#10a37f" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M32.66 29C37 32 43 29 43 22" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M15.34 29C11 32 5 29 5 22" stroke="#10a37f" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M15.34 19C11 16 5 19 5 26" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// --- TYPE DEFINITIONS ---

export interface SignInPageProps {
  mode?: 'signin' | 'signup';
  onModeChange?: (mode: 'signin' | 'signup') => void;
  onEmailSignIn?: (email: string, password?: string) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
  onResetPassword?: (email: string) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children, focused }: { children: React.ReactNode; focused?: boolean }) => (
  <div className={`
    rounded-xl border bg-white/50 backdrop-blur-sm transition-all duration-200
    ${focused 
      ? 'border-primary ring-2 ring-primary/20' 
      : 'border-gray-200 hover:border-gray-300'
    }
  `}>
    {children}
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  mode = 'signin',
  onModeChange,
  onEmailSignIn,
  onGoogleSignIn,
  onResetPassword,
  isLoading = false,
  error,
  success,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const isSignUp = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (showResetForm && onResetPassword) {
      onResetPassword(email);
      return;
    }
    if (onEmailSignIn) {
      await onEmailSignIn(email, isSignUp ? password : undefined);
    }
  };

  const handleGoogleClick = async () => {
    if (onGoogleSignIn) {
      await onGoogleSignIn();
    }
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-secondary">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="flex flex-col gap-6 animate-fade-up">
              {/* Logo */}
              <div className="flex justify-center mb-2">
                <Link to="/" className="flex items-center gap-2">
                  <KejuLogo />
                  <span className="text-2xl font-semibold text-gray-900">Keju</span>
                </Link>
              </div>

              {/* Title */}
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-900">Reset your password</h1>
                <p className="mt-2 text-gray-500">Enter your email and we'll send you a reset link</p>
              </div>

              {/* Error/Success */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <GlassInputWrapper focused={emailFocused}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent text-sm p-3.5 rounded-xl focus:outline-none"
                      disabled={isLoading}
                      required
                    />
                  </GlassInputWrapper>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <button
                onClick={() => setShowResetForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-secondary">
      {/* Left column: Sign-in form */}
      <section className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6 animate-fade-up">
            {/* Logo */}
            <div className="flex justify-center mb-2">
              <Link to="/" className="flex items-center gap-2">
                <KejuLogo />
                <span className="text-2xl font-semibold text-gray-900">Keju</span>
              </Link>
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-2 text-gray-500">
                {isSignUp 
                  ? 'Start building your career with AI-powered tools' 
                  : 'Sign in to continue to your workspace'
                }
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-fade-in">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 animate-fade-in">
                {success}
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-gray-200"></span>
              <span className="px-4 text-sm text-gray-400 bg-surface-secondary absolute">or</span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <GlassInputWrapper focused={emailFocused}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm p-3.5 rounded-xl focus:outline-none"
                    disabled={isLoading}
                    required
                  />
                </GlassInputWrapper>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <GlassInputWrapper focused={passwordFocused}>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        placeholder="Create a password"
                        className="w-full bg-transparent text-sm p-3.5 pr-12 rounded-xl focus:outline-none"
                        disabled={isLoading}
                        required={isSignUp}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </GlassInputWrapper>
                  <p className="mt-1.5 text-xs text-gray-500">At least 6 characters</p>
                </div>
              )}

              {!isSignUp && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowResetForm(true)}
                    className="text-sm text-primary hover:text-primary-600 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isLoading 
                  ? (isSignUp ? 'Creating account...' : 'Sending magic link...') 
                  : (isSignUp ? 'Create account' : 'Send magic link')
                }
              </button>
            </form>

            {/* Footer text */}
            <p className="text-center text-sm text-gray-500">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => onModeChange?.(isSignUp ? 'signin' : 'signup')}
                className="text-primary hover:text-primary-600 font-medium transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>

            {/* Terms */}
            <p className="text-center text-xs text-gray-400">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: Hero image (hidden on mobile) */}
      <section className="hidden lg:flex flex-1 relative p-4">
        <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-md px-8">
              {/* Feature highlights */}
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">AI-Powered Resumes</h3>
                      <p className="mt-1 text-sm text-gray-500">Generate tailored resumes that beat ATS systems</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-fade-up" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Career Coaching</h3>
                      <p className="mt-1 text-sm text-gray-500">Get personalized guidance for your career journey</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-fade-up" style={{ animationDelay: '0.6s' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">GDPR Compliant</h3>
                      <p className="mt-1 text-sm text-gray-500">Your data is secure and hosted in the EU</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignInPage;

