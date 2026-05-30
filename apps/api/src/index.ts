// ─── ShopSense API Server ────────────────────────────────────────────────────
// Production: runs in cluster mode (1 worker per CPU core).
// Development: runs single-process for easier debugging.

import cluster from 'node:cluster';
import os from 'node:os';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '@shopsense/db';
import { connectRedis, disconnectRedis } from '@shopsense/cache';
import { initRAG } from '@shopsense/rag-core';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { chatRateLimit, generalRateLimit } from './middleware/apiRateLimiter';
import chatRoutes from './routes/chat';
import productRoutes from './routes/products';
import sessionRoutes from './routes/sessions';

// Load env vars
dotenv.config({ path: '../../.env' });

const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const CLUSTER_WORKERS = parseInt(
  process.env.CLUSTER_WORKERS || String(Math.min(os.cpus().length, 4)),
  10
);

// ─── Cluster Mode (Production Only) ─────────────────────────────────────────
// Each worker gets its own event loop, so one stuck request can't block others.
// If a worker crashes (OOM, unhandled error), the primary respawns it.

if (IS_PRODUCTION && cluster.isPrimary) {
  console.log(`[Cluster] Primary ${process.pid} starting ${CLUSTER_WORKERS} workers...`);

  for (let i = 0; i < CLUSTER_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(
      `[Cluster] Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`
    );
    // Brief delay to prevent crash-loop
    setTimeout(() => cluster.fork(), 1000);
  });

  // ─── Graceful Shutdown (Primary) ─────────────────────────────────────────
  const shutdownPrimary = () => {
    console.log('\n[Cluster] Primary shutting down all workers...');
    for (const id in cluster.workers) {
      cluster.workers[id]?.process.kill('SIGTERM');
    }
    setTimeout(() => process.exit(0), 5000);
  };

  process.on('SIGINT', shutdownPrimary);
  process.on('SIGTERM', shutdownPrimary);
} else {
  // ─── Worker Process (or single-process in dev) ───────────────────────────
  startServer();
}

async function startServer(): Promise<void> {
  const app = express();

  // ─── Middleware ──────────────────────────────────────────────────────────
  app.use(cors());
  app.use(express.json());

  // ─── Health Check ───────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid,
      worker: cluster.isWorker ? cluster.worker?.id : 'primary',
    });
  });

  // ─── Routes (with rate limiting) ────────────────────────────────────────
  app.use('/api/chat', chatRateLimit, chatRoutes);
  app.use('/api/products', generalRateLimit, productRoutes);
  app.use('/api/sessions', generalRateLimit, sessionRoutes);

  // ─── Error Handling ─────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  // ─── Unhandled Rejection Safety Net ─────────────────────────────────────
  // Prevents a stray rejected promise from crashing the entire process.
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Server] Unhandled promise rejection:', reason);
    // In production, log to monitoring but don't crash.
    // In dev, let it be loud.
  });

  process.on('uncaughtException', (err) => {
    console.error('[Server] Uncaught exception:', err);
    // Give in-flight requests 3s to finish, then exit
    setTimeout(() => process.exit(1), 3000);
  });

  // ─── Server Start ──────────────────────────────────────────────────────
  try {
    const workerLabel = cluster.isWorker ? `Worker ${cluster.worker?.id}` : 'Server';
    console.log(`[${workerLabel}] Starting ShopSense API (PID: ${process.pid})...`);

    // Connect to databases
    await connectDB();
    await connectRedis();
    await initRAG();

    app.listen(PORT, () => {
      console.log(`[${workerLabel}] ShopSense API running on http://localhost:${PORT}`);
      console.log(`[${workerLabel}] Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }

  // ─── Graceful Shutdown (Worker) ─────────────────────────────────────────
  async function shutdown(): Promise<void> {
    const label = cluster.isWorker ? `Worker ${cluster.worker?.id}` : 'Server';
    console.log(`\n[${label}] Shutting down gracefully...`);
    await disconnectDB();
    await disconnectRedis();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export default {};
