// ─── Concurrency Guard ───────────────────────────────────────────────────────
// Semaphore-based limiter for the RAG pipeline. Prevents N concurrent requests
// from launching 4N outbound API calls and exhausting memory / rate limits.
// Zero external dependencies — uses a simple promise-based semaphore.

interface QueuedRequest {
  resolve: () => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class ConcurrencyGuard {
  private running = 0;
  private readonly queue: QueuedRequest[] = [];

  /**
   * @param maxConcurrent  Max pipelines running simultaneously (default: 8)
   * @param maxQueueSize   Max requests waiting in line before 503 (default: 200)
   * @param queueTimeoutMs How long a request waits before getting 503 (default: 30s)
   */
  constructor(
    private readonly maxConcurrent: number = 8,
    private readonly maxQueueSize: number = 200,
    private readonly queueTimeoutMs: number = 30_000
  ) {}

  /** Current number of active pipeline executions */
  get activeCount(): number {
    return this.running;
  }

  /** Current number of queued requests waiting */
  get pendingCount(): number {
    return this.queue.length;
  }

  /**
   * Acquire a slot. Resolves when a slot is available.
   * Throws if the queue is full or the wait times out.
   */
  async acquire(): Promise<void> {
    if (this.running < this.maxConcurrent) {
      this.running++;
      return;
    }

    if (this.queue.length >= this.maxQueueSize) {
      throw new ConcurrencyError(
        'Server is at capacity. Please try again in a few seconds.',
        503
      );
    }

    // Wait in queue
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        // Remove from queue on timeout
        const idx = this.queue.findIndex((q) => q.resolve === resolve);
        if (idx !== -1) this.queue.splice(idx, 1);
        reject(
          new ConcurrencyError(
            'Request timed out waiting for an available slot.',
            503
          )
        );
      }, this.queueTimeoutMs);

      this.queue.push({ resolve, reject, timer });
    });
  }

  /** Release a slot and let the next queued request proceed. */
  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      clearTimeout(next.timer);
      // Don't decrement `running` — the slot is handed to the next request
      next.resolve();
    } else {
      this.running--;
    }
  }

  /**
   * Run a function with concurrency control.
   * Acquires a slot, runs `fn`, then releases — even on error.
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

export class ConcurrencyError extends Error {
  statusCode: number;
  isOperational = true;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ConcurrencyError';
    this.statusCode = statusCode;
  }
}

// ─── Singleton for RAG pipeline ──────────────────────────────────────────────
// 8 concurrent pipelines × 4 API calls each = 32 max outbound calls
// This keeps Groq (30 RPM) and Gemini within safe limits.
const MAX_CONCURRENT = parseInt(process.env.RAG_MAX_CONCURRENT || '8', 10);
const MAX_QUEUE = parseInt(process.env.RAG_MAX_QUEUE || '200', 10);
const QUEUE_TIMEOUT = parseInt(process.env.RAG_QUEUE_TIMEOUT_MS || '30000', 10);

export const pipelineGuard = new ConcurrencyGuard(MAX_CONCURRENT, MAX_QUEUE, QUEUE_TIMEOUT);
