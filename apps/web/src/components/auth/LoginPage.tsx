import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { signIn, signUp } from '../../lib/authClient';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Spinner({ size = 20, color = 'rgba(255,255,255,0.8)' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.25" strokeWidth="3" />
      <path d="M12 2a10 10 0 0110 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

type Tab = 'signin' | 'signup';

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email || !password) return setError('Please fill in all fields.');
    setIsLoading(true);
    try {
      const result = await signIn.email({ email: email.trim(), password, callbackURL: '/home' });
      if (result.error) setError(result.error.message ?? 'Invalid email or password.');
      else {
        toast.success('Welcome back! 👋');
        navigate('/home', { replace: true });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!name || !email || !password) return setError('Please fill in all fields.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setIsLoading(true);
    try {
      const result = await signUp.email({ name: name.trim(), email: email.trim(), password, callbackURL: '/home' });
      if (result.error) setError(result.error.message ?? 'Could not create account.');
      else {
        toast.success('Account created! Welcome to ShopSense 🛍️');
        navigate('/home', { replace: true });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    clearError();
    setGoogleLoading(true);
    try {
      await signIn.social({ provider: 'google', callbackURL: '/home' });
    } catch {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const isDisabled = isLoading || googleLoading;

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] flex items-center justify-center p-6 relative font-sans">
      <div 
        className="w-full max-w-[420px] bg-[#FFFFFF] border border-[var(--border)] p-12 relative z-10 shadow-[0_4px_32px_rgba(29,28,28,0.08)]"
        style={{ borderRadius: '16px' }}
      >
        <div className="text-center mb-8">
          <h1 
            className="text-[#1D1C1C] mb-2"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1 }}
          >
            SHOPSENSE
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Your AI-powered shopping assistant</p>
        </div>

        <div className="flex border-b border-[var(--border)] mb-8">
          <button
            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${tab === 'signin' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            onClick={() => { setTab('signin'); clearError(); }}
            type="button"
          >
            Sign In
            {tab === 'signin' && <div className="absolute bottom-[-1px] left-[20%] right-[20%] h-[2px] bg-[var(--bg-pink)]" />}
          </button>
          <button
            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${tab === 'signup' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            onClick={() => { setTab('signup'); clearError(); }}
            type="button"
          >
            Sign Up
            {tab === 'signup' && <div className="absolute bottom-[-1px] left-[20%] right-[20%] h-[2px] bg-[var(--bg-pink)]" />}
          </button>
        </div>

        <button
          className="btn-ghost w-full flex items-center justify-center gap-2 mb-6"
          onClick={handleGoogle}
          disabled={isDisabled}
          type="button"
        >
          {googleLoading ? (
            <><Spinner size={16} /> Redirecting…</>
          ) : (
            <><GoogleIcon /> Continue with Google</>
          )}
        </button>

        <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs mb-6 before:flex-1 before:h-[1px] before:bg-[var(--border)] after:flex-1 after:h-[1px] after:bg-[var(--border)]">
          OR
        </div>

        {error && (
          <div className="bg-[rgba(255,103,139,0.1)] border border-[rgba(255,103,139,0.25)] text-[var(--bg-pink)] text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} className="flex flex-col gap-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
              <input
                className="w-full bg-[var(--bg-cream)] border border-[var(--border)] rounded-[8px] text-[var(--text-primary)] placeholder-[var(--text-muted)] px-4 py-3 focus:outline-none focus:border-[var(--bg-pink)] focus:shadow-[0_0_0_3px_rgba(255,103,139,0.15)] transition-all"
                type="text"
                placeholder="Ravi Kumar"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError(); }}
                disabled={isDisabled}
              />
            </div>
          )}
          <div>
            <label className="block text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider mb-2">Email</label>
            <input
              className="w-full bg-[var(--bg-cream)] border border-[var(--border)] rounded-[8px] text-[var(--text-primary)] placeholder-[var(--text-muted)] px-4 py-3 focus:outline-none focus:border-[var(--bg-pink)] focus:shadow-[0_0_0_3px_rgba(255,103,139,0.15)] transition-all"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              disabled={isDisabled}
            />
          </div>
          <div>
            <label className="block text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider mb-2">
              Password {tab === 'signup' && <span className="lowercase font-normal tracking-normal text-[11px] ml-1">(min 8 chars)</span>}
            </label>
            <input
              className="w-full bg-[var(--bg-cream)] border border-[var(--border)] rounded-[8px] text-[var(--text-primary)] placeholder-[var(--text-muted)] px-4 py-3 focus:outline-none focus:border-[var(--bg-pink)] focus:shadow-[0_0_0_3px_rgba(255,103,139,0.15)] transition-all"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              disabled={isDisabled}
            />
          </div>
          <button
            className="btn-primary w-full mt-2"
            type="submit"
            disabled={isDisabled}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size={16} />
                {tab === 'signin' ? 'Signing in…' : 'Creating account…'}
              </span>
            ) : (
              tab === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <p className="text-[var(--text-muted)] text-xs text-center mt-8 leading-relaxed">
          By continuing, you agree to our{' '}
          <a href="#" className="text-[var(--bg-pink)] hover:underline">Terms</a> &{' '}
          <a href="#" className="text-[var(--bg-pink)] hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
