// ─── ShopSense Shared Types ──────────────────────────────────────────────────
// Zero 'any' types. Every interface is fully typed.

export type ProductSource = 'amazon' | 'flipkart';

export type ProductCategory =
  | 'laptop'
  | 'phone'
  | 'tablet'
  | 'headphones'
  | 'camera'
  | 'television'
  | 'smartwatch'
  | 'general';

export type ChunkType = 'metadata' | 'specs' | 'reviews';

export type Intent = 'new_search' | 'follow_up' | 'comparison' | 'clarification';

export type ChatRole = 'user' | 'assistant' | 'system';

// ─── Core Product ────────────────────────────────────────────────────────────

export interface UnifiedProduct {
  id: string;
  source: ProductSource;
  title: string;
  price_inr: number;
  rating: number;
  review_count: number;
  specs: Record<string, string>;
  affiliate_url: string;
  image_url: string;
  raw_text: string;
  category: ProductCategory;
  reviews: string[];
}

// ─── Chunks ──────────────────────────────────────────────────────────────────

export interface ProductChunk {
  id: string;
  product_id: string;
  chunk_type: ChunkType;
  content: string;
  source: ProductSource;
  price_inr: number;
  category: ProductCategory;
}

// ─── Vector Store ────────────────────────────────────────────────────────────

export interface VectorEntry {
  id: string;
  values: number[];
  payload: {
    product_id: string;
    chunk_type: ChunkType;
    source: ProductSource;
    price_inr: number;
    session_id: string;
    content: string;
    category: ProductCategory;
  };
}

export interface VectorMatch {
  id: string;
  score: number;
  payload: {
    product_id: string;
    chunk_type: ChunkType;
    source: ProductSource;
    price_inr: number;
    session_id: string;
    content: string;
    category: ProductCategory;
  };
}

export interface VectorStoreInterface {
  upsert(vectors: VectorEntry[]): Promise<void>;
  query(
    embedding: number[],
    topK: number,
    filter?: Record<string, unknown>
  ): Promise<VectorMatch[]>;
  deleteBySession(sessionId: string): Promise<void>;
  ensureCollection(): Promise<void>;
}

// ─── Query Parsing ───────────────────────────────────────────────────────────

export interface ParsedQuery {
  rawQuery: string;
  budget: number | null;
  budgetType: 'under' | 'around' | 'exact' | null;
  category: ProductCategory;
  brands: string[];
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  products?: UnifiedProduct[];
  intent: Intent;
  retrievedChunkIds: string[];
  productIds?: string[];
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface SessionData {
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  productIds: string[];
}

// ─── Product Fetcher ─────────────────────────────────────────────────────────

export interface ProductFetcher {
  fetch(query: ParsedQuery): Promise<UnifiedProduct[]>;
}

// ─── RAG Pipeline Config ─────────────────────────────────────────────────────

export interface RAGConfig {
  similarityThreshold: number;
  topK: number;
  maxHistoryTurns: number;
  embeddingModel: string;
  chatModel: string;
}

export const DEFAULT_RAG_CONFIG: RAGConfig = {
  similarityThreshold: 0.72,
  topK: 8,
  maxHistoryTurns: 6,
  embeddingModel: 'text-embedding-004',
  chatModel: 'llama-3.3-70b-versatile', // Groq free tier: 14,400 req/day
};
