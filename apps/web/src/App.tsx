// ─── App Entry ───────────────────────────────────────────────────────────────

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ChatWindow from './components/chat/ChatWindow';
import LoginPage from './components/auth/LoginPage';
import LandingPage from './pages/LandingPage';
import HomeDashboard from './pages/HomeDashboard';
import { AboutUsPage, ContactUsPage, FAQPage, PrivacyPolicyPage, TermsConditionsPage, SitemapPage } from './pages/legal/LegalPages';

// ─── Shared Toaster Options ───────────────────────────────────────────────────

const toasterOptions = {
  style: {
    background: '#111118',
    border: '1px solid #1E1E2E',
    color: '#F0F0F5',
    fontSize: '13px',
  },
} as const;

// ─── Public Route ─────────────────────────────────────────────────────────────
// Redirects already-authenticated users away from /login to /home.

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/home" replace /> : <>{children}</>;
}

// ─── Protected Route ──────────────────────────────────────────────────────────
// Redirects unauthenticated users to /login.

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#0A0A0F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="12" cy="12" r="10" stroke="rgba(108,99,255,0.2)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0110 10" stroke="#6C63FF" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span style={{ color: '#4A4A5E', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
            Loading…
          </span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// ─── Index Route ──────────────────────────────────────────────────────────────
// Renders LandingPage for unauthenticated users, redirects to /home for authenticated users
// Note: We don't render ChatWindow here anymore, /chat does that.

function IndexRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#0A0A0F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="12" cy="12" r="10" stroke="rgba(108,99,255,0.2)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0110 10" stroke="#6C63FF" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span style={{ color: '#4A4A5E', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
            Loading…
          </span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />;
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={toasterOptions} richColors />
        <Routes>
          {/* Public: login / register */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Root: LandingPage (public) or redirect to /home */}
          <Route path="/" element={<IndexRoute />} />

          {/* Static Pages */}
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsConditionsPage />} />
          <Route path="/sitemap" element={<SitemapPage />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatProvider>
                  <ChatWindow />
                </ChatProvider>
              </ProtectedRoute>
            }
          />

          {/* Catch-all → root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
