// ─── Sessions Route ──────────────────────────────────────────────────────────

import { Router, Request, Response } from 'express';
import { Session, ChatTurn } from '@shopsense/db';
import { QdrantVectorStore } from '@shopsense/rag-core';
import { randomUUID } from 'crypto';

const router = Router();
const vectorStore = new QdrantVectorStore();

/**
 * POST /api/sessions — Create new session
 */
router.post('/', async (_req: Request, res: Response) => {
  try {
    const sessionId = randomUUID();
    const session = await Session.create({
      sessionId,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    res.status(201).json({ success: true, data: { sessionId: session.sessionId } });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/sessions/:id — Get session with chat history
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.id });
    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    const chatHistory = await ChatTurn.find({ sessionId: req.params.id })
      .sort({ timestamp: 1 })
      .lean();

    res.json({
      success: true,
      data: { session, chatHistory },
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/sessions/:id — Cleanup session + vector store data
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id as string;

    // Delete from vector store
    await vectorStore.deleteBySession(sessionId);

    // Delete chat history
    await ChatTurn.deleteMany({ sessionId });

    // Delete session
    await Session.deleteOne({ sessionId });

    res.json({ success: true, message: 'Session cleaned up' });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
