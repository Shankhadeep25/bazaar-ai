// ─── Embedder ────────────────────────────────────────────────────────────────
// Uses Google Gemini gemini-embedding-2 with 768 output dimensions.
// Integrates with L2 embedding cache to avoid re-embedding identical content.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCachedEmbedding, setCachedEmbedding } from '@shopsense/cache';
import { getContentHash } from './chunker';

let genAI: GoogleGenerativeAI | null = null;

function getGenerativeAI(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  }
  return genAI;
}

const EMBED_TIMEOUT_MS = parseInt(process.env.EMBED_TIMEOUT_MS || '20000', 10);

/**
 * Run a promise with a timeout. Rejects with an error if the timeout fires first.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`[Embedder] ${label} timed out after ${ms}ms`)),
      ms
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

/**
 * Embed a single text string. Uses L2 cache.
 */
export async function embedText(text: string): Promise<number[]> {
  const hash = 'gemini-embedding-2:768:' + getContentHash(text);

  // Check L2 cache first
  const cached = await getCachedEmbedding(hash);
  if (cached) return cached;

  // Generate embedding (with timeout)
  const ai = getGenerativeAI();
  const model = ai.getGenerativeModel({ model: 'gemini-embedding-2' });
  const result = await withTimeout(
    model.embedContent({
      content: { role: 'user', parts: [{ text }] },
      outputDimensionality: 768,
    } as any),
    EMBED_TIMEOUT_MS,
    'embedText'
  );
  const vector = result.embedding.values;

  // Cache the result
  await setCachedEmbedding(hash, vector);

  return vector;
}

/**
 * Embed multiple texts with caching. Returns array in same order.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const results: (number[] | null)[] = new Array(texts.length).fill(null);
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];

  // Check cache for each text
  for (let i = 0; i < texts.length; i++) {
    const hash = 'gemini-embedding-2:768:' + getContentHash(texts[i]);
    const cached = await getCachedEmbedding(hash);
    if (cached) {
      results[i] = cached;
    } else {
      uncachedIndices.push(i);
      uncachedTexts.push(texts[i]);
    }
  }

  // Batch embed uncached texts (with timeout)
  if (uncachedTexts.length > 0) {
    const ai = getGenerativeAI();
    const model = ai.getGenerativeModel({ model: 'gemini-embedding-2' });
    
    // Google API batchEmbedContents takes { requests: [{content: ...}] }
    const result = await withTimeout(
      model.batchEmbedContents({
        requests: uncachedTexts.map((text) => ({
          content: { role: 'user', parts: [{ text }] },
          outputDimensionality: 768,
        } as any)),
      }),
      EMBED_TIMEOUT_MS,
      'batchEmbedContents'
    );

    const vectors = result.embeddings.map((e) => e.values);

    for (let j = 0; j < uncachedIndices.length; j++) {
      const idx = uncachedIndices[j];
      results[idx] = vectors[j];
      // Cache each new embedding
      const hash = 'gemini-embedding-2:768:' + getContentHash(texts[idx]);
      await setCachedEmbedding(hash, vectors[j]);
    }
  }

  return results as number[][];
}
