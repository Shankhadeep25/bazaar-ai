// ─── RAG Pipeline ────────────────────────────────────────────────────────────
// Orchestrates: intent detection → product fetch → chunk → embed → retrieve → LLM response

import Groq from 'groq-sdk';
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

// ─── Groq Chat Client ────────────────────────────────────────────────────────
// Using Groq (free tier: 14,400 req/day, 30 RPM) for chat generation.
// Google Gemini is kept ONLY for embeddings (working fine).
const GROQ_TIMEOUT_MS = parseInt(process.env.GROQ_TIMEOUT_MS || '30000', 10);

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      timeout: GROQ_TIMEOUT_MS,
    });
  }
  return groqClient;
}

/**
 * Throws if the AbortSignal has been triggered (client disconnected).
 */
function checkAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new Error('[RAG] Request aborted by client');
  }
}

const SYSTEM_PROMPT = `You are ShopSense, an AI shopping assistant for the Indian market.
Base your answers ONLY on the context provided below. If the context does not contain relevant information, politely let the user know that you cannot find products matching their exact criteria.
Always cite the product name and source (Amazon/Flipkart).
All prices are in ₹ INR. Be extremely careful with numbers and math—double check if a price fits within the user's budget.
When comparing products, use a structured format with clear categories.
Never make up specifications, prices, or reviews. Only use what's in the context.`;

/**
 * Index products into the vector store for a session.
 */
async function indexProducts(
  products: UnifiedProduct[],
  sessionId: string
): Promise<string[]> {
  const chunks = chunkProducts(products);
  console.log(`[RAG] indexProducts: ${chunks.length} chunks created`);

  // Only embed specs and reviews chunks (not metadata)
  const embeddableChunks = chunks.filter(
    (c) => c.chunk_type === 'specs' || c.chunk_type === 'reviews'
  );
  const texts = embeddableChunks.map((c) => c.content);
  console.log(`[RAG] indexProducts: embedding ${texts.length} texts (total chars: ${texts.reduce((a, t) => a + t.length, 0)})`);

  const embeddings = await embedTexts(texts);
  console.log(`[RAG] indexProducts: embeddings done, got ${embeddings.length} vectors`);

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

  console.log(`[RAG] indexProducts: upserting ${vectors.length} vectors to Qdrant...`);
  await vectorStore.upsert(vectors);
  console.log(`[RAG] indexProducts: upsert done`);

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
): Promise<{ context: string; chunkIds: string[]; productIds: string[] }> {
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
      productIds: [...new Set(bestMatches.map((m) => m.payload.product_id))],
    };
  }

  const context = goodMatches.map((m) => m.payload.content).join('\n\n---\n\n');
  return {
    context,
    chunkIds: goodMatches.map((m) => m.id),
    productIds: [...new Set(goodMatches.map((m) => m.payload.product_id))],
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
export async function processChat(
  request: ChatRequest,
  signal?: AbortSignal
): Promise<ChatResponse> {
  const { sessionId, message, history } = request;

  // Step 1: Detect intent
  checkAborted(signal);
  const intent = await detectIntent(message, history);
  console.log(`[RAG] Intent: ${intent} | Message: "${message.slice(0, 60)}..."`);

  let products: UnifiedProduct[] | undefined;
  let chunkIds: string[] = [];

  // Step 2: If new_search, fetch and index products
  if (intent === 'new_search') {
    checkAborted(signal);
    const parsed = parseQuery(message);
    console.log(`[RAG] Parsed: category=${parsed.category}, budget=${parsed.budget}, brands=${parsed.brands.join(',')}`);

    products = await fetcher.fetch(parsed);
    console.log(`[RAG] Fetched ${products.length} products`);

    if (products.length > 0) {
      checkAborted(signal);
      try {
        const indexedIds = await indexProducts(products, sessionId);
        chunkIds = indexedIds;
        console.log(`[RAG] Indexed ${indexedIds.length} chunks`);
      } catch (indexErr) {
        const e = indexErr as any;
        console.error(`[RAG] indexProducts FAILED:`, e.message, e.response?.data || e.cause || '');
        throw indexErr;
      }
    }
  }

  // Step 3: Retrieve relevant context
  checkAborted(signal);
  console.log('[RAG] Step 3: Retrieving context...');
  const { context, chunkIds: retrievedIds, productIds } = await retrieveContext(
    message,
    sessionId
  );
  chunkIds = [...chunkIds, ...retrievedIds];
  console.log(`[RAG] Step 3 done. Context length: ${context.length}`);

  // Step 4: Build full context with metadata
  let fullContext = context;
  if (products && products.length > 0) {
    // Filter the products array to ONLY include those that were deemed relevant by Qdrant
    products = products.filter((p) => productIds.includes(p.id));
    
    const metadataCtx = buildMetadataContext(products);
    fullContext = `Available Products:\n${metadataCtx}\n\n---\n\nDetailed Information:\n${context}`;
  }

  // Step 5: Build conversation for Groq (OpenAI-compatible format)
  checkAborted(signal);
  const recentHistory = history.slice(-DEFAULT_RAG_CONFIG.maxHistoryTurns);
  const systemContent = `${SYSTEM_PROMPT}\n\nContext:\n${fullContext || 'No product data available yet. Ask the user what they are looking for.'}`;

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemContent },
    ...recentHistory.map((h) => ({
      role: (h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  // Step 6: Call Groq LLM (with abort signal)
  console.log('[RAG] Step 6: Calling Groq LLM...');
  const completion = await getGroq().chat.completions.create(
    {
      model: DEFAULT_RAG_CONFIG.chatModel,
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    },
    { signal: signal as any }
  );
  console.log('[RAG] Step 6 done.');
  const responseText = completion.choices[0]?.message?.content ?? 'No response generated.';

  return {
    sessionId,
    message: responseText,
    products,
    intent,
    retrievedChunkIds: chunkIds,
    productIds,
  };
}

/**
 * Stream version of processChat for SSE.
 */
export async function processStreamChat(
  request: ChatRequest,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<ChatResponse> {
  const { sessionId, message, history } = request;

  checkAborted(signal);
  const intent = await detectIntent(message, history);
  let products: UnifiedProduct[] | undefined;
  let chunkIds: string[] = [];

  if (intent === 'new_search') {
    checkAborted(signal);
    const parsed = parseQuery(message);
    products = await fetcher.fetch(parsed);

    if (products.length > 0) {
      checkAborted(signal);
      const indexedIds = await indexProducts(products, sessionId);
      chunkIds = indexedIds;
    }
  }

  checkAborted(signal);
  const { context, chunkIds: retrievedIds, productIds } = await retrieveContext(message, sessionId);
  chunkIds = [...chunkIds, ...retrievedIds];

  let fullContext = context;
  if (products && products.length > 0) {
    // Filter the products array to ONLY include those that were deemed relevant by Qdrant
    products = products.filter((p) => productIds.includes(p.id));
    fullContext = `Available Products:\n${buildMetadataContext(products)}\n\n---\n\nDetailed Information:\n${context}`;
  }

  checkAborted(signal);
  const recentHistory = history.slice(-DEFAULT_RAG_CONFIG.maxHistoryTurns);
  const systemContent = `${SYSTEM_PROMPT}\n\nContext:\n${fullContext || 'No product data available yet.'}`;

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemContent },
    ...recentHistory.map((h) => ({
      role: (h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  const stream = await getGroq().chat.completions.create(
    {
      model: DEFAULT_RAG_CONFIG.chatModel,
      messages,
      temperature: 0.3,
      max_tokens: 1024,
      stream: true,
    },
    { signal: signal as any }
  );

  let fullResponse = '';
  for await (const chunk of stream) {
    checkAborted(signal);
    const token = chunk.choices[0]?.delta?.content ?? '';
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
    productIds,
  };
}

/**
 * Initialize the vector store collection. Call once on server start.
 */
export async function initRAG(): Promise<void> {
  await vectorStore.ensureCollection();
  console.log('[RAG] Pipeline initialized');
}
