// ─── Better Auth Instance ─────────────────────────────────────────────────────
// Uses a native MongoClient (separate from Mongoose but same MongoDB instance).
// Better Auth manages its own: `user`, `session`, `account` collections.
// Your existing Mongoose models (Product, Session, ChatTurn) are unaffected.

import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopsense';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('[DEBUG] MONGODB_URI in auth.ts:', process.env.MONGODB_URI ? 'DEFINED' : 'UNDEFINED');
console.log('[DEBUG] BETTER_AUTH_SECRET in auth.ts:', process.env.BETTER_AUTH_SECRET ? 'DEFINED' : 'UNDEFINED');

// Dedicated MongoDB client for Better Auth
// .db() returns the Db instance that mongodbAdapter expects
const mongoClient = new MongoClient(MONGODB_URI);
const db = mongoClient.db();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',

  database: mongodbAdapter(db),

  // ─── Email & Password ───────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // ─── Google OAuth ───────────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },

  // ─── Session ────────────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 days
    updateAge: 60 * 60 * 24,         // Refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,                // Re-validate every 5 min
    },
  },

  // ─── Trusted Origins ────────────────────────────────────────────────────────
  trustedOrigins: [FRONTEND_URL],
});

export type Auth = typeof auth;
