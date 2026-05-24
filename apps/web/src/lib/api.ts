// ─── ShopSense API Client ────────────────────────────────────────────────────

import type {
  ApiResponse,
  ChatResponse,
  CompareResponse,
  ProductSearchResponse,
  SessionWithHistory,
  UnifiedProduct,
} from './types';

const API_BASE = 'http://localhost:3001/api';

// ─── Generic Fetch Wrapper ───────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: response.statusText })) as { error?: string };
    throw new Error(errorBody.error ?? `API Error: ${response.status}`);
  }

  const result = (await response.json()) as ApiResponse<T>;

  if (!result.success) {
    throw new Error(result.error ?? 'Unknown API error');
  }

  return result.data;
}

// ─── Health ──────────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json() as Promise<{ status: string; timestamp: string; uptime: number }>;
}

// ─── Chat (non-streaming) ────────────────────────────────────────────────────

export async function chatNonStreaming(
  sessionId: string | undefined,
  message: string,
  history: Array<{ role: string; content: string; timestamp: Date }>
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message, history }),
  });
}

// ─── Chat (SSE streaming) — raw fetch, handled by sseClient.ts ──────────────

export function buildChatSSERequest(
  sessionId: string | undefined,
  message: string,
  history: Array<{ role: string; content: string; timestamp: Date }>,
  signal?: AbortSignal
): { url: string; init: RequestInit } {
  return {
    url: `${API_BASE}/chat`,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ sessionId, message, history }),
      signal,
    },
  };
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function searchProducts(query: string): Promise<ProductSearchResponse> {
  return apiFetch<ProductSearchResponse>(`/products?query=${encodeURIComponent(query)}`);
}

export async function getProduct(id: string): Promise<UnifiedProduct> {
  return apiFetch<UnifiedProduct>(`/products/${encodeURIComponent(id)}`);
}

export async function compareProducts(productIds: string[]): Promise<CompareResponse> {
  return apiFetch<CompareResponse>('/products/compare', {
    method: 'POST',
    body: JSON.stringify({ productIds }),
  });
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function createSession(): Promise<{ sessionId: string }> {
  return apiFetch<{ sessionId: string }>('/sessions', { method: 'POST' });
}

export async function getSession(sessionId: string): Promise<SessionWithHistory> {
  return apiFetch<SessionWithHistory>(`/sessions/${encodeURIComponent(sessionId)}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await apiFetch<{ message: string }>(`/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  });
}
