/* eslint-disable react-refresh/only-export-components */
// ─── Auth Context ─────────────────────────────────────────────────────────────
// Wraps Better Auth's useSession() and exposes a clean API to the whole app.

import React, { createContext, useContext } from 'react';
import { useSession } from '../lib/authClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  const value: AuthContextValue = {
    user: (session?.user as AuthUser | undefined) ?? null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
