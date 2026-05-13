// ─── Embedding Cache (L2) ────────────────────────────────────────────────────
// Caches embedding vectors by MD5 hash of text content.
// TTL: 24 hours. Prevents re-embedding identical chunks.

import { cacheGet, cacheSet } from './index';

const EMBEDDING_TTL = 86400; // 24 hours in seconds
const KEY_PREFIX = 'emb';

/**
 * Get cached embedding vector for a content hash.
 */
export async function getCachedEmbedding(contentHash: string): Promise<number[] | null> {
  const key = `${KEY_PREFIX}:${contentHash}`;
  const cached = await cacheGet(key);
  if (!cached) return null;

  try {
    return JSON.parse(cached) as number[];
  } catch {
    return null;
  }
}

/**
 * Cache an embedding vector by content hash.
 */
export async function setCachedEmbedding(
  contentHash: string,
  vector: number[]
): Promise<void> {
  const key = `${KEY_PREFIX}:${contentHash}`;
  await cacheSet(key, JSON.stringify(vector), EMBEDDING_TTL);
}
