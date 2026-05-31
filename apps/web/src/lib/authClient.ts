// ─── Better Auth React Client ─────────────────────────────────────────────────
// Connects to the Better Auth server running at apps/api.
// Exposes typed hooks and methods for auth actions.

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // Points directly at the Express API server
  // (cookies are sent cross-origin with `credentials: include`)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Named exports for convenient imports throughout the app
export const { signIn, signUp, signOut, useSession } = authClient;
