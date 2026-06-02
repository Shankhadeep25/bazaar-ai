// ─── Better Auth React Client ─────────────────────────────────────────────────
// Connects to the Better Auth server running at apps/api.
// Exposes typed hooks and methods for auth actions.

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // Points directly at the proxy (Vite locally, NGINX in production)
  // which forwards /api to the Express backend.
  baseURL: import.meta.env.VITE_API_URL,
});

// Named exports for convenient imports throughout the app
export const { signIn, signUp, signOut, useSession } = authClient;
