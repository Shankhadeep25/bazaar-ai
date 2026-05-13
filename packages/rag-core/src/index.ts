// ─── RAG Core Package Entry Point ────────────────────────────────────────────

export * from './types';
export { parseQuery } from './queryParser';
export { detectIntent, detectIntentRuleBased } from './intentDetector';
export { MockProductFetcher } from './productFetcher';
export { chunkProduct, chunkProducts, getContentHash } from './chunker';
export { embedText, embedTexts } from './embedder';
export { QdrantVectorStore } from './vectorStore';
export { processChat, processStreamChat, initRAG } from './ragPipeline';
export { MOCK_PRODUCTS } from './mockData';
