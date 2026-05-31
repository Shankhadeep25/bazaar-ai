// ─── Auth Route ───────────────────────────────────────────────────────────────
// Forwards all /api/auth/** requests to Better Auth's built-in handler.
// Better Auth handles: sign-in, sign-up, sign-out, session, OAuth callbacks, etc.

import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth';

const router = Router();

// All Better Auth endpoints (POST /sign-in/email, GET /session, etc.)
// are handled automatically by toNodeHandler
router.all('/{*splat}', toNodeHandler(auth));

export default router;
