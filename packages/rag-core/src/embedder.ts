// ─── Embedder ────────────────────────────────────────────────────────────────
// Uses Google Gemini gemini-embedding-2 with 768 output dimensions.
// Integrates with L2 embedding cache to avoid re-embedding identical content.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCachedEmbedding, setCachedEmbedding } from '@shopsense/cache/src/embeddingCache';
import { getContentHash } from './chunker';

let genAI: GoogleGenerativeAI | null = null;

function getGenerativeAI(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  }
  return genAI;
}

/**
 * Embed a single text string. Uses L2 cache.
 */
export async function embedText(text: string): Promise<number[]> {
  const hash = 'gemini-embedding-2:768:' + getContentHash(text);

  // Check L2 cache first
  const cached = await getCachedEmbedding(hash);
  if (cached) return cached;

  // Generate embedding
  const ai = getGenerativeAI();
  const model = ai.getGenerativeModel({ model: 'gemini-embedding-2' });
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text }] },
    outputDimensionality: 768,
  } as any);
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

  // Batch embed uncached texts
  if (uncachedTexts.length > 0) {
    const ai = getGenerativeAI();
    const model = ai.getGenerativeModel({ model: 'gemini-embedding-2' });
    
    // Google API batchEmbedContents takes { requests: [{content: ...}] }
    const result = await model.batchEmbedContents({
      requests: uncachedTexts.map((text) => ({
        content: { role: 'user', parts: [{ text }] },
        outputDimensionality: 768,
      } as any)),
    });

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
