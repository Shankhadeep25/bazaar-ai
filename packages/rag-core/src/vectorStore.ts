// ─── Qdrant Vector Store ─────────────────────────────────────────────────────
// Implements VectorStoreInterface using @qdrant/js-client-rest.
// Uses dynamic import since Qdrant client is ESM-only.

import { VectorStoreInterface, VectorEntry, VectorMatch } from './types.js';

const VECTOR_DIM = 768; // Gemini text-embedding-004

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
    qdrantClientInstance = new QdrantClient({ url });
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
          vectors: {
            size: VECTOR_DIM,
            distance: 'Cosine',
          },
        });
        console.log(`[Qdrant] Collection '${this.collectionName}' created (${VECTOR_DIM}-dim, Cosine)`);
      } else {
        console.log(`[Qdrant] Collection '${this.collectionName}' already exists`);
      }
    } catch (err) {
      console.error('[Qdrant] Failed to ensure collection:', err);
      throw err;
    }
  }

  async upsert(vectors: VectorEntry[]): Promise<void> {
    if (vectors.length === 0) return;
    const client = await getClient();

    const points = vectors.map((v) => ({
      id: v.id,
      vector: v.values,
      payload: v.payload,
    }));

    // Batch in groups of 100
    const batchSize = 100;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      await client.upsert(this.collectionName, {
        wait: true,
        points: batch,
      });
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
