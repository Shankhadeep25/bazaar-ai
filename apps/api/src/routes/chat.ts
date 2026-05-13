// ─── Chat Route ──────────────────────────────────────────────────────────────
// POST /api/chat — RAG pipeline with SSE streaming

import { Router, Request, Response } from 'express';
import { processStreamChat, processChat, UnifiedProduct } from '@shopsense/rag-core';
import { ChatTurn, Session } from '@shopsense/db';
import { createAppError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/chat
 * Body: { sessionId, message, history? }
 * Streams response via SSE, then stores turn in MongoDB.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { sessionId, message, history = [] } = req.body;

    if (!sessionId || !message) {
      throw createAppError('sessionId and message are required', 400);
    }

    // Update session last active
    await Session.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    // Store user turn
    await ChatTurn.create({
      sessionId,
      role: 'user',
      content: message,
      intent: '',
      retrievedChunkIds: [],
    });

    // Check if client wants streaming
    const wantsStream = req.headers.accept === 'text/event-stream';

    if (wantsStream) {
      // SSE streaming response
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });

      // Send products event first if new_search
      const result = await processStreamChat(
        { sessionId, message, history },
        (token: string) => {
          res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
        }
      );

      // Send products if available
      if (result.products) {
        res.write(
          `data: ${JSON.stringify({ type: 'products', content: result.products })}\n\n`
        );
      }

      // Send done event
      res.write(
        `data: ${JSON.stringify({ type: 'done', intent: result.intent })}\n\n`
      );
      res.end();

      // Store assistant turn (after response sent)
      await ChatTurn.create({
        sessionId,
        role: 'assistant',
        content: result.message,
        intent: result.intent,
        retrievedChunkIds: result.retrievedChunkIds,
      });

      // Update session with product IDs
      if (result.products) {
        await Session.findOneAndUpdate(
          { sessionId },
          {
            $addToSet: {
              productIds: { $each: result.products.map((p: UnifiedProduct) => p.id) },
            },
          }
        );
      }
    } else {
      // Regular JSON response
      const result = await processChat({ sessionId, message, history });

      // Store assistant turn
      await ChatTurn.create({
        sessionId,
        role: 'assistant',
        content: result.message,
        intent: result.intent,
        retrievedChunkIds: result.retrievedChunkIds,
      });

      if (result.products) {
        await Session.findOneAndUpdate(
          { sessionId },
          {
            $addToSet: {
              productIds: { $each: result.products.map((p: UnifiedProduct) => p.id) },
            },
          }
        );
      }

      res.json({ success: true, data: result });
    }
  } catch (err) {
    const error = err as Error;
    console.error('[Chat] Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

export default router;
