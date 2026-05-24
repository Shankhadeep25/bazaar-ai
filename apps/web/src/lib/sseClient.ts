// ─── SSE Client ──────────────────────────────────────────────────────────────
// Uses fetch + ReadableStream to handle POST-based SSE (EventSource only supports GET)

import type { SSEEvent } from './types';

export interface SSECallbacks {
  onSession: (sessionId: string) => void;
  onToken: (token: string) => void;
  onProducts: (products: SSEEvent extends { type: 'products'; content: infer P } ? P : never) => void;
  onDone: (intent: string) => void;
  onError: (error: Error) => void;
}

/**
 * Stream chat response via SSE using fetch + ReadableStream.
 * Returns an AbortController to allow cancellation.
 */
export async function streamChat(
  url: string,
  init: RequestInit,
  callbacks: SSECallbacks
): Promise<void> {
  const response = await fetch(url, init);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: response.statusText })) as { error?: string };
    throw new Error(errorBody.error ?? `SSE Error: ${response.status}`);
  }

  const body = response.body;
  if (!body) {
    throw new Error('Response body is null — SSE not supported');
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const payload = JSON.parse(trimmed.slice(6)) as SSEEvent;

          switch (payload.type) {
            case 'session':
              callbacks.onSession(payload.sessionId);
              break;
            case 'token':
              callbacks.onToken(payload.content);
              break;
            case 'products':
              callbacks.onProducts(payload.content);
              break;
            case 'done':
              callbacks.onDone(payload.intent);
              break;
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // User aborted — not an error
      return;
    }
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
}
