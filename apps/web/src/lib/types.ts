// ─── ShopSense Frontend Types ────────────────────────────────────────────────

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

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  sessionId?: string;
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  products?: UnifiedProduct[];
  intent: Intent;
  retrievedChunkIds: string[];
}

// ─── Display Message (extended for UI) ───────────────────────────────────────

export interface DisplayMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  products?: UnifiedProduct[];
  intent?: Intent;
  isStreaming?: boolean;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface SessionData {
  sessionId: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
  productIds: string[];
}

export interface SessionWithHistory {
  session: SessionData;
  chatHistory: Array<{
    sessionId: string;
    role: ChatRole;
    content: string;
    timestamp: string;
    intent: string;
    retrievedChunkIds: string[];
    products?: UnifiedProduct[];
  }>;
}

// ─── Product Search ──────────────────────────────────────────────────────────

export interface ParsedQuery {
  rawQuery: string;
  budget: number | null;
  budgetType: 'under' | 'around' | 'exact' | null;
  category: ProductCategory;
  brands: string[];
}

export interface ProductSearchResponse {
  products: UnifiedProduct[];
  parsed: ParsedQuery;
  count: number;
}

// ─── Compare ─────────────────────────────────────────────────────────────────

export interface SpecRow {
  spec: string;
  values: string[];
}

export interface CompareResponse {
  products: UnifiedProduct[];
  specKeys: string[];
  specMatrix: SpecRow[];
}

// ─── API Response Wrapper ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ─── SSE Events ──────────────────────────────────────────────────────────────

export interface SSESessionEvent {
  type: 'session';
  sessionId: string;
}

export interface SSETokenEvent {
  type: 'token';
  content: string;
}

export interface SSEProductsEvent {
  type: 'products';
  content: UnifiedProduct[];
}

export interface SSEDoneEvent {
  type: 'done';
  intent: Intent;
}

export type SSEEvent = SSESessionEvent | SSETokenEvent | SSEProductsEvent | SSEDoneEvent;

// ─── Saved Session (for sidebar) ─────────────────────────────────────────────

export interface SavedSession {
  sessionId: string;
  title: string;
  createdAt: string;
  lastActiveAt: string;
}
