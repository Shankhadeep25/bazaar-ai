import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { processStreamChat, processChat, UnifiedProduct } from '@shopsense/rag-core';
import { ChatTurn, Session } from '@shopsense/db';
import { createAppError } from '../middleware/errorHandler';
import { pipelineGuard } from '../middleware/concurrencyGuard';

const router = Router();

// ─── Helper: persist chat turns (fire-and-forget, never crashes the process) ─
async function persistTurns(
  sessionId: string,
  message: string,
  result: { message: string; intent: string; retrievedChunkIds: string[]; products?: UnifiedProduct[] }
): Promise<void> {
  try {
    await ChatTurn.create({ sessionId, role: 'user', content: message, intent: '', retrievedChunkIds: [] });
    await ChatTurn.create({
      sessionId,
      role: 'assistant',
      content: result.message,
      intent: result.intent,
      retrievedChunkIds: result.retrievedChunkIds,
      products: result.products,
    });

    if (result.products) {
      await Session.findOneAndUpdate(
        { sessionId },
        { $addToSet: { productIds: { $each: result.products.map((p: UnifiedProduct) => p.id) } } }
      );
    }
  } catch (err) {
    // Log but never crash — these writes are best-effort after the response is sent
    console.error('[Chat] Failed to persist chat turns:', (err as Error).message);
  }
}

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

    // ── AbortController: cancels pipeline if client disconnects ──────────
    const abortController = new AbortController();
    let clientDisconnected = false;

    req.on('close', () => {
      if (!res.writableFinished) {
        clientDisconnected = true;
        abortController.abort();
        console.log(`[Chat] Client disconnected mid-request (session: ${sessionId})`);
      }
    });

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

      // ── Concurrency-guarded pipeline execution ─────────────────────────
      const result = await pipelineGuard.run(() =>
        processStreamChat(
          { sessionId, message, history },
          (token: string) => {
            if (!clientDisconnected) {
              res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
            }
          },
          abortController.signal
        )
      ) as { message: string; intent: string; retrievedChunkIds: string[]; products?: UnifiedProduct[] };

      if (!clientDisconnected) {
        if (result.products) {
          res.write(`data: ${JSON.stringify({ type: 'products', content: result.products })}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ type: 'done', intent: result.intent })}\n\n`);
        res.end();
      }

      // ✅ Fix: persist turns safely — never crashes the process
      await persistTurns(sessionId, message, result);

    } else {
      // ── Concurrency-guarded pipeline execution ─────────────────────────
      const result = await pipelineGuard.run(() =>
        processChat({ sessionId, message, history }, abortController.signal)
      ) as { message: string; intent: string; retrievedChunkIds: string[]; products?: UnifiedProduct[] };

      // ✅ Fix: persist turns safely — never crashes the process
      await persistTurns(sessionId, message, result);

      if (!clientDisconnected) {
        res.json({ success: true, data: result });
      }
    }
  } catch (err) {
    const error = err as any;

    // Don't log abort errors as failures — they're expected on disconnect
    if (error.message?.includes('aborted')) {
      console.log(`[Chat] Pipeline aborted for session ${sessionId}`);
      if (!res.headersSent) res.status(499).end(); // 499 = Client Closed Request
      return;
    }

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