// ─── Embedder ────────────────────────────────────────────────────────────────
// Uses Google Gemini text-embedding-004 (768-dim) via @langchain/google-genai.
// Integrates with L2 embedding cache to avoid re-embedding identical content.

import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { getCachedEmbedding, setCachedEmbedding } from '@shopsense/cache/src/embeddingCache';
import { getContentHash } from './chunker';

let embeddingsModel: GoogleGenerativeAIEmbeddings | null = null;

function getEmbeddingsModel(): GoogleGenerativeAIEmbeddings {
  if (!embeddingsModel) {
    embeddingsModel = new GoogleGenerativeAIEmbeddings({
      model: 'text-embedding-004',
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }
  return embeddingsModel;
}

/**
 * Embed a single text string. Uses L2 cache.
 */
export async function embedText(text: string): Promise<number[]> {
  const hash = getContentHash(text);

  // Check L2 cache first
  const cached = await getCachedEmbedding(hash);
  if (cached) return cached;

  // Generate embedding
  const model = getEmbeddingsModel();
  const vector = await model.embedQuery(text);

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
    const hash = getContentHash(texts[i]);
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
    const model = getEmbeddingsModel();
    const vectors = await model.embedDocuments(uncachedTexts);

    for (let j = 0; j < uncachedIndices.length; j++) {
      const idx = uncachedIndices[j];
      results[idx] = vectors[j];
      // Cache each new embedding
      const hash = getContentHash(texts[idx]);
      await setCachedEmbedding(hash, vectors[j]);
    }
  }

  return results as number[][];
}
