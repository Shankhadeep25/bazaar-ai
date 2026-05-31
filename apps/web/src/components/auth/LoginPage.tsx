// ─── Login / Register Page ────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { signIn, signUp } from '../../lib/authClient';

// ─── Google SVG Icon ─────────────────────────────────────────────────────────

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

// ─── Animated Background Orbs ─────────────────────────────────────────────────

function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top-left accent orb */}
      <div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{
          width: '500px',
          height: '500px',
          top: '-150px',
          left: '-150px',
          background: 'radial-gradient(circle, #6C63FF 0%, transparent 70%)',
          animation: 'float1 8s ease-in-out infinite',
        }}
      />
      {/* Bottom-right coral orb */}
      <div
        className="absolute rounded-full blur-3xl opacity-15"
        style={{
          width: '400px',
          height: '400px',
          bottom: '-100px',
          right: '-100px',
          background: 'radial-gradient(circle, #FF6B6B 0%, transparent 70%)',
          animation: 'float2 10s ease-in-out infinite',
        }}
      />
      {/* Center subtle glow */}
      <div
        className="absolute rounded-full blur-3xl opacity-10"
        style={{
          width: '600px',
          height: '600px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #6C63FF 0%, transparent 70%)',
        }}
      />
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 20px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, -30px) scale(1.08); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .auth-card-enter {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .input-field {
          background: rgba(255,255,255,0.04);
          border: 1px solid #1E1E2E;
          border-radius: 10px;
          color: #F0F0F5;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 12px 16px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .input-field::placeholder {
          color: #4A4A5E;
        }
        .input-field:focus {
          border-color: #6C63FF;
          background: rgba(108, 99, 255, 0.06);
          box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.12);
        }
        .btn-primary {
          background: linear-gradient(135deg, #6C63FF 0%, #8B85FF 100%);
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 13px 24px;
          width: 100%;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(108, 99, 255, 0.35);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-google {
          background: rgba(255,255,255,0.05);
          border: 1px solid #1E1E2E;
          border-radius: 10px;
          color: #F0F0F5;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          padding: 12px 24px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .btn-google:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          border-color: #2E2E42;
          transform: translateY(-1px);
        }
        .btn-google:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          color: #8B8B9E;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 10px 0;
          text-transform: uppercase;
          transition: color 0.2s;
          position: relative;
        }
        .tab-btn.active {
          color: #F0F0F5;
        }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 20%;
          right: 20%;
          height: 2px;
          background: linear-gradient(90deg, #6C63FF, #8B85FF);
          border-radius: 2px;
        }
        .tab-btn:hover:not(.active) {
          color: #C0C0CF;
        }
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #4A4A5E;
          font-size: 12px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #1E1E2E;
        }
        .logo-gradient {
          background: linear-gradient(135deg, #6C63FF, #FF6B6B);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .error-msg {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.25);
          border-radius: 8px;
          color: #FF6B6B;
          font-size: 13px;
          padding: 10px 14px;
        }
      `}</style>
    </div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────

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

  // ── Sign In ─────────────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.email({
        email: email.trim(),
        password,
        callbackURL: '/',
      });

      if (result.error) {
        setError(result.error.message ?? 'Invalid email or password.');
      } else {
        toast.success('Welcome back! 👋');
        navigate('/', { replace: true });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: '/',
      });

      if (result.error) {
        setError(result.error.message ?? 'Could not create account.');
      } else {
        toast.success('Account created! Welcome to ShopSense 🛍️');
        navigate('/', { replace: true });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    clearError();
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: window.location.origin + '/',
      });
    } catch {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const isDisabled = isLoading || googleLoading;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0A0A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      <BackgroundOrbs />

      {/* ── Auth Card ─────────────────────────────────────────────────── */}
      <div
        className="auth-card-enter"
        style={{
          background: 'rgba(17, 17, 24, 0.85)',
          border: '1px solid #1E1E2E',
          borderRadius: '20px',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.06)',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ── Logo & Heading ──────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Logo mark */}
          <div
            style={{
              width: '52px',
              height: '52px',
              background: 'linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(255,107,107,0.15) 100%)',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#6C63FF" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M3 6h18" stroke="#6C63FF" strokeWidth="1.8"/>
              <path d="M16 10a4 4 0 01-8 0" stroke="#FF6B6B" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '26px',
              fontWeight: '800',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            <span className="logo-gradient">ShopSense</span>
          </h1>
          <p style={{ color: '#8B8B9E', fontSize: '14px', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
            Your AI-powered shopping assistant
          </p>
        </div>

        {/* ── Tab Switcher ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #1E1E2E',
            marginBottom: '28px',
          }}
        >
          <button
            className={`tab-btn ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => { setTab('signin'); clearError(); }}
            id="tab-signin"
            type="button"
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); clearError(); }}
            id="tab-signup"
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* ── Google OAuth Button ──────────────────────────────────────── */}
        <button
          className="btn-google"
          onClick={handleGoogle}
          disabled={isDisabled}
          id="btn-google-auth"
          type="button"
        >
          {googleLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Spinner size={16} />
              Redirecting…
            </span>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="divider" style={{ margin: '20px 0' }}>
          or continue with email
        </div>

        {/* ── Error Message ────────────────────────────────────────────── */}
        {error && (
          <div className="error-msg" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* ── Sign In Form ─────────────────────────────────────────────── */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label
                htmlFor="signin-email"
                style={{ display: 'block', color: '#8B8B9E', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}
              >
                Email
              </label>
              <input
                id="signin-email"
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                disabled={isDisabled}
                autoComplete="email"
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="signin-password"
                style={{ display: 'block', color: '#8B8B9E', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}
              >
                Password
              </label>
              <input
                id="signin-password"
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                disabled={isDisabled}
                autoComplete="current-password"
              />
            </div>
            <button
              className="btn-primary"
              type="submit"
              disabled={isDisabled}
              id="btn-signin-submit"
              style={{ marginTop: '4px' }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Spinner size={16} color="rgba(255,255,255,0.7)" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── Sign Up Form ─────────────────────────────────────────────── */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label
                htmlFor="signup-name"
                style={{ display: 'block', color: '#8B8B9E', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}
              >
                Full Name
              </label>
              <input
                id="signup-name"
                className="input-field"
                type="text"
                placeholder="Ravi Kumar"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError(); }}
                disabled={isDisabled}
                autoComplete="name"
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="signup-email"
                style={{ display: 'block', color: '#8B8B9E', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}
              >
                Email
              </label>
              <input
                id="signup-email"
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                disabled={isDisabled}
                autoComplete="email"
              />
            </div>
            <div>
              <label
                htmlFor="signup-password"
                style={{ display: 'block', color: '#8B8B9E', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}
              >
                Password
                <span style={{ color: '#4A4A5E', fontSize: '11px', marginLeft: '6px', textTransform: 'none', letterSpacing: 0 }}>
                  (min 8 chars)
                </span>
              </label>
              <input
                id="signup-password"
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                disabled={isDisabled}
                autoComplete="new-password"
              />
            </div>
            <button
              className="btn-primary"
              type="submit"
              disabled={isDisabled}
              id="btn-signup-submit"
              style={{ marginTop: '4px' }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Spinner size={16} color="rgba(255,255,255,0.7)" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        )}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <p
          style={{
            color: '#4A4A5E',
            fontSize: '12px',
            textAlign: 'center',
            marginTop: '24px',
            marginBottom: 0,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.6,
          }}
        >
          By continuing, you agree to our{' '}
          <span style={{ color: '#6C63FF', cursor: 'pointer' }}>Terms</span> &{' '}
          <span style={{ color: '#6C63FF', cursor: 'pointer' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ size = 20, color = 'rgba(255,255,255,0.8)' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.25" strokeWidth="3" />
      <path d="M12 2a10 10 0 0110 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
