import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { processStreamChat, processChat, UnifiedProduct } from '@shopsense/rag-core';
import { ChatTurn, Session } from '@shopsense/db';
import { createAppError } from '../middleware/errorHandler';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { message, history = [] } = req.body;
  const sessionId: string = req.body.sessionId?.trim() || randomUUID(); // ✅ trim + fallback

  try {
    if (!message?.trim()) {
      throw createAppError('message is required', 400);
    }

    await Session.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
      { upsert: true, returnDocument: 'after' }
    );

    // ✅ Fix: use includes() — handles "text/event-stream, */*" and missing header
    const wantsStream = req.headers.accept?.includes('text/event-stream') ?? false;

    if (wantsStream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write(`data: ${JSON.stringify({ type: 'session', sessionId })}\n\n`);

      const result = await processStreamChat(
        { sessionId, message, history },
        (token: string) => {
          res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
        }
      );

      if (result.products) {
        res.write(`data: ${JSON.stringify({ type: 'products', content: result.products })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ type: 'done', intent: result.intent })}\n\n`);
      res.end();

      // ✅ Fix: persist turns AFTER successful response
      await ChatTurn.create({ sessionId, role: 'user', content: message, intent: '', retrievedChunkIds: [] });
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
          { $addToSet: { productIds: { $each: result.products.map((p: UnifiedProduct) => p.id) } } }
        );
      }
    } else {
      const result = await processChat({ sessionId, message, history });

      // ✅ Fix: persist turns AFTER successful response
      await ChatTurn.create({ sessionId, role: 'user', content: message, intent: '', retrievedChunkIds: [] });
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
          { $addToSet: { productIds: { $each: result.products.map((p: UnifiedProduct) => p.id) } } }
        );
      }

      res.json({ success: true, data: result });
    }
  } catch (err) {
    const error = err as any;
    console.error('[Chat] Error:', error.stack || error.message);

    if (!res.headersSent) {
      // ✅ Fix: always surface actionable error details
      res.status(error.statusCode ?? 500).json({
        success: false,
        error: error.message,
        ...(process.env.NODE_ENV !== 'production' && {
          stack: error.stack,
          details: error.response?.data ?? error.cause ?? null,
        }),
      });
    }
  }
});

export default router;