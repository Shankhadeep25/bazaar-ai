// ─── Qdrant Vector Store ─────────────────────────────────────────────────────
// Implements VectorStoreInterface using @qdrant/js-client-rest.
// Uses dynamic import since Qdrant client is ESM-only.

import { VectorStoreInterface, VectorEntry, VectorMatch } from './types.js';

const VECTOR_DIM = 768; // Gemini embedding-2 with 768 truncation

// Lazy-loaded Qdrant client
let qdrantClientInstance: InstanceType<Awaited<ReturnType<typeof getQdrantClass>>> | null = null;

async function getQdrantClass() {
  const { QdrantClient } = await import('@qdrant/js-client-rest');
  return QdrantClient;
}

async function getClient(): Promise<InstanceType<Awaited<ReturnType<typeof getQdrantClass>>>> {
  if (!qdrantClientInstance) {
    const QdrantClient = await getQdrantClass();
    const url = process.env.QDRANT_URL || 'http://localhost:6333';
    const apiKey = process.env.QDRANT_API_KEY;
    qdrantClientInstance = new QdrantClient({
      url,
      ...(apiKey && apiKey !== 'your_qdrant_api_key_here' ? { apiKey } : {}),
    });
  }
  return qdrantClientInstance;
}

export class QdrantVectorStore implements VectorStoreInterface {
  private collectionName: string;

  constructor() {
    this.collectionName = process.env.QDRANT_COLLECTION || 'shopsense_products';
  }

  async ensureCollection(): Promise<void> {
    try {
      const client = await getClient();
      const collections = await client.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === this.collectionName
      );

      if (!exists) {
        await client.createCollection(this.collectionName, {
          vectors: { size: VECTOR_DIM, distance: 'Cosine' },
        });
        console.log(`[Qdrant] Collection '${this.collectionName}' created (${VECTOR_DIM}-dim, Cosine)`);
      } else {
        // ── Validate existing collection config ───────────────────────
        const info = await client.getCollection(this.collectionName);
        const vectorsConfig = info.config?.params?.vectors;
        console.log('[Qdrant] Existing collection vector config:', JSON.stringify(vectorsConfig));

        // Named-vector collections have a Record shape; unnamed have { size, distance }
        const isNamedVectors = vectorsConfig && typeof vectorsConfig === 'object'
          && !('size' in vectorsConfig);
        const existingDim = !isNamedVectors
          ? (vectorsConfig as any)?.size
          : (Object.values(vectorsConfig as Record<string, { size?: number }>)[0])?.size;

        if (isNamedVectors || existingDim !== VECTOR_DIM) {
          console.warn(
            `[Qdrant] Config mismatch (namedVectors=${isNamedVectors}, dim=${existingDim}). ` +
            `Recreating as unnamed ${VECTOR_DIM}-dim Cosine collection...`
          );
          await client.deleteCollection(this.collectionName);
          await client.createCollection(this.collectionName, {
            vectors: { size: VECTOR_DIM, distance: 'Cosine' },
          });
          console.log(`[Qdrant] Collection recreated (${VECTOR_DIM}-dim, Cosine, unnamed)`);
        } else {
          console.log(`[Qdrant] Collection '${this.collectionName}' OK (${existingDim}-dim, unnamed)`);
        }
      }

      // Ensure payload index for session_id
      try {
        await client.createPayloadIndex(this.collectionName, {
          field_name: 'session_id',
          field_schema: 'keyword',
          wait: true,
        });
      } catch (_) { /* already exists */ }

    } catch (err) {
      console.error('[Qdrant] Failed to ensure collection:', err);
      throw err;
    }
  }

  async upsert(vectors: VectorEntry[]): Promise<void> {
    if (vectors.length === 0) return;
    const client = await getClient();

    const points = vectors.map((v) => {
      // Ensure plain JS number[] — Gemini SDK can return a typed/array-like object
      const vector = Array.from(v.values) as number[];

      // Pre-flight dimension check — catches mismatches before Qdrant rejects them
      if (vector.length !== VECTOR_DIM) {
        throw new Error(
          `[Qdrant] Dimension mismatch: expected ${VECTOR_DIM}, got ${vector.length} (id=${v.id})`
        );
      }

      return { id: v.id, vector, payload: v.payload };
    });

    const batchSize = 100;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      try {
        await client.upsert(this.collectionName, { wait: true, points: batch });
      } catch (err: any) {
        // Capture full Qdrant error body for diagnosis
        const detail = err?.data ?? err?.body ?? err?.response ?? err?.cause ?? null;
        console.error('[Qdrant] Upsert FAILED. Full error:', {
          message: err?.message,
          status: err?.status,
          detail: JSON.stringify(detail),
          samplePoint: JSON.stringify({
            id: batch[0]?.id,
            vectorLen: batch[0]?.vector?.length,
            payloadKeys: Object.keys(batch[0]?.payload ?? {}),
          }),
        });
        throw err;
      }
    }
    console.log(`[Qdrant] Upserted ${vectors.length} vectors`);
  }

  async query(
    embedding: number[],
    topK: number,
    filter?: Record<string, unknown>
  ): Promise<VectorMatch[]> {
    const client = await getClient();

    const searchParams: {
      vector: number[];
      limit: number;
      with_payload: boolean;
      filter?: Record<string, unknown>;
    } = {
      vector: embedding,
      limit: topK,
      with_payload: true,
    };

    if (filter) {
      searchParams.filter = filter;
    }

    const results = await client.search(this.collectionName, searchParams);

    return results.map((r) => ({
      id: String(r.id),
      score: r.score,
      payload: r.payload as VectorMatch['payload'],
    }));
  }

  async deleteBySession(sessionId: string): Promise<void> {
    try {
      const client = await getClient();
      await client.delete(this.collectionName, {
        filter: {
          must: [
            {
              key: 'session_id',
              match: { value: sessionId },
            },
          ],
        },
      });
      console.log(`[Qdrant] Deleted vectors for session: ${sessionId}`);
    } catch (err) {
      console.error('[Qdrant] Failed to delete session vectors:', err);
    }
  }
}
