// ─── requireAuth Middleware ───────────────────────────────────────────────────
// Validates the Better Auth session cookie on every protected request.
// Attaches `req.user` for downstream handlers.

import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image?: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string | string[]>,
    });

    if (!session?.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in to continue.',
      });
      return;
    }

    // Attach authenticated user to request for downstream use
    req.user = session.user;
    next();
  } catch (err) {
    console.error('[requireAuth] Session validation error:', err);
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to continue.',
    });
  }
}
