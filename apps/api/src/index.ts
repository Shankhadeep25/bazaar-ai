// ─── ShopSense API Server ────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '@shopsense/db';
import { connectRedis, disconnectRedis } from '@shopsense/cache';
import { initRAG } from '@shopsense/rag-core';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import chatRoutes from './routes/chat';
import productRoutes from './routes/products';
import sessionRoutes from './routes/sessions';

// Load env vars
dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sessions', sessionRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Server Start ────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    console.log('[Server] Starting ShopSense API...');

    // Connect to databases
    await connectDB();
    await connectRedis();
    await initRAG();

    app.listen(PORT, () => {
      console.log(`[Server] ShopSense API running on http://localhost:${PORT}`);
      console.log(`[Server] Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
async function shutdown(): Promise<void> {
  console.log('\n[Server] Shutting down gracefully...');
  await disconnectDB();
  await disconnectRedis();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();

export default app;
