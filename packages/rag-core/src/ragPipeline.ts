// ─── RAG Pipeline ────────────────────────────────────────────────────────────
// Orchestrates: intent detection → product fetch → chunk → embed → retrieve → LLM response

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  UnifiedProduct,
  VectorEntry,
  DEFAULT_RAG_CONFIG,
} from './types';
import { parseQuery } from './queryParser';
import { detectIntent } from './intentDetector';
import { MockProductFetcher } from './productFetcher';
import { chunkProducts, getContentHash } from './chunker';
import { embedText, embedTexts } from './embedder';
import { QdrantVectorStore } from './vectorStore';

const fetcher = new MockProductFetcher();
const vectorStore = new QdrantVectorStore();

let chatLLM: ChatGoogleGenerativeAI | null = null;

function getChatLLM(): ChatGoogleGenerativeAI {
  if (!chatLLM) {
    chatLLM = new ChatGoogleGenerativeAI({
      model: DEFAULT_RAG_CONFIG.chatModel,
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0.3,
      maxOutputTokens: 1024,
      streaming: true,
    });
  }
  return chatLLM;
}

const SYSTEM_PROMPT = `You are ShopSense, an AI shopping assistant for the Indian market.
Answer ONLY from the context provided below. If a fact is not in the context, say "I don't have that data."
Always cite the product name and source (Amazon/Flipkart).
All prices are in ₹ INR. Be helpful, concise, and accurate.
When comparing products, use a structured format with clear categories.
Never make up specifications or reviews. Only use what's in the context.`;

/**
 * Index products into the vector store for a session.
 */
async function indexProducts(
  products: UnifiedProduct[],
  sessionId: string
): Promise<string[]> {
  const chunks = chunkProducts(products);

  // Only embed specs and reviews chunks (not metadata)
  const embeddableChunks = chunks.filter(
    (c) => c.chunk_type === 'specs' || c.chunk_type === 'reviews'
  );
  const texts = embeddableChunks.map((c) => c.content);
  const embeddings = await embedTexts(texts);

  // Build vector entries
  const vectors: VectorEntry[] = embeddableChunks.map((chunk, i) => ({
    id: chunk.id,
    values: embeddings[i],
    payload: {
      product_id: chunk.product_id,
      chunk_type: chunk.chunk_type,
      source: chunk.source,
      price_inr: chunk.price_inr,
      session_id: sessionId,
      content: chunk.content,
      category: chunk.category,
    },
  }));

  await vectorStore.upsert(vectors);

  // Also store metadata chunks as context (not embedded in vector store)
  const metadataChunks = chunks.filter((c) => c.chunk_type === 'metadata');

  return chunks.map((c) => c.id);
}

/**
 * Retrieve relevant chunks from vector store.
 */
async function retrieveContext(
  query: string,
  sessionId: string,
  topK: number = DEFAULT_RAG_CONFIG.topK
): Promise<{ context: string; chunkIds: string[] }> {
  const queryEmbedding = await embedText(query);

  const filter = {
    must: [
      { key: 'session_id', match: { value: sessionId } },
    ],
  };

  const matches = await vectorStore.query(queryEmbedding, topK, filter);

  // Check similarity threshold
  const goodMatches = matches.filter(
    (m) => m.score >= DEFAULT_RAG_CONFIG.similarityThreshold
  );

  if (goodMatches.length === 0 && matches.length > 0) {
    // All below threshold — use best available but flag it
    const bestMatches = matches.slice(0, 3);
    const context = bestMatches.map((m) => m.payload.content).join('\n\n---\n\n');
    return {
      context: `[Note: Low confidence results]\n\n${context}`,
      chunkIds: bestMatches.map((m) => m.id),
    };
  }

  const context = goodMatches.map((m) => m.payload.content).join('\n\n---\n\n');
  return {
    context,
    chunkIds: goodMatches.map((m) => m.id),
  };
}

/**
 * Build metadata context for products (not embedded, just injected).
 */
function buildMetadataContext(products: UnifiedProduct[]): string {
  return products
    .map(
      (p) =>
        `• ${p.title} — ₹${p.price_inr.toLocaleString('en-IN')} | ${p.rating}★ (${p.review_count} reviews) | ${p.source}`
    )
    .join('\n');
}

/**
 * Main RAG pipeline entry point.
 */
export async function processChat(request: ChatRequest): Promise<ChatResponse> {
  const { sessionId, message, history } = request;

  // Step 1: Detect intent
  const intent = await detectIntent(message, history);
  console.log(`[RAG] Intent: ${intent} | Message: "${message.slice(0, 60)}..."`);

  let products: UnifiedProduct[] | undefined;
  let chunkIds: string[] = [];

  // Step 2: If new_search, fetch and index products
  if (intent === 'new_search') {
    const parsed = parseQuery(message);
    console.log(`[RAG] Parsed: category=${parsed.category}, budget=${parsed.budget}, brands=${parsed.brands.join(',')}`);

    products = await fetcher.fetch(parsed);
    console.log(`[RAG] Fetched ${products.length} products`);

    if (products.length > 0) {
      const indexedIds = await indexProducts(products, sessionId);
      chunkIds = indexedIds;
      console.log(`[RAG] Indexed ${indexedIds.length} chunks`);
    }
  }

  // Step 3: Retrieve relevant context
  const { context, chunkIds: retrievedIds } = await retrieveContext(
    message,
    sessionId
  );
  chunkIds = [...chunkIds, ...retrievedIds];

  // Step 4: Build full context with metadata
  let fullContext = context;
  if (products && products.length > 0) {
    const metadataCtx = buildMetadataContext(products);
    fullContext = `Available Products:\n${metadataCtx}\n\n---\n\nDetailed Information:\n${context}`;
  }

  // Step 5: Build conversation for LLM
  const recentHistory = history.slice(-DEFAULT_RAG_CONFIG.maxHistoryTurns);
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'system' as const, content: `Context:\n${fullContext || 'No product data available yet. Ask the user what they are looking for.'}` },
    ...recentHistory.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user' as const, content: message },
  ];

  // Step 6: Call Gemini LLM
  const llm = getChatLLM();
  const response = await llm.invoke(messages);
  const responseText = typeof response.content === 'string'
    ? response.content
    : 'I encountered an issue generating a response. Please try again.';

  return {
    sessionId,
    message: responseText,
    products,
    intent,
    retrievedChunkIds: chunkIds,
  };
}

/**
 * Stream version of processChat for SSE.
 */
export async function processStreamChat(
  request: ChatRequest,
  onToken: (token: string) => void
): Promise<ChatResponse> {
  const { sessionId, message, history } = request;

  const intent = await detectIntent(message, history);
  let products: UnifiedProduct[] | undefined;
  let chunkIds: string[] = [];

  if (intent === 'new_search') {
    const parsed = parseQuery(message);
    products = await fetcher.fetch(parsed);

    if (products.length > 0) {
      const indexedIds = await indexProducts(products, sessionId);
      chunkIds = indexedIds;
    }
  }

  const { context, chunkIds: retrievedIds } = await retrieveContext(message, sessionId);
  chunkIds = [...chunkIds, ...retrievedIds];

  let fullContext = context;
  if (products && products.length > 0) {
    fullContext = `Available Products:\n${buildMetadataContext(products)}\n\n---\n\nDetailed Information:\n${context}`;
  }

  const recentHistory = history.slice(-DEFAULT_RAG_CONFIG.maxHistoryTurns);
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'system' as const, content: `Context:\n${fullContext || 'No product data available yet.'}` },
    ...recentHistory.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user' as const, content: message },
  ];

  const llm = getChatLLM();
  const stream = await llm.stream(messages);

  let fullResponse = '';
  for await (const chunk of stream) {
    const token = typeof chunk.content === 'string' ? chunk.content : '';
    if (token) {
      fullResponse += token;
      onToken(token);
    }
  }

  return {
    sessionId,
    message: fullResponse,
    products,
    intent,
    retrievedChunkIds: chunkIds,
  };
}

/**
 * Initialize the vector store collection. Call once on server start.
 */
export async function initRAG(): Promise<void> {
  await vectorStore.ensureCollection();
  console.log('[RAG] Pipeline initialized');
}
