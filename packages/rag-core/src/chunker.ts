// ─── Chunker ─────────────────────────────────────────────────────────────────
// Splits a UnifiedProduct into tagged chunks for embedding and retrieval.

import { UnifiedProduct, ProductChunk } from './types';
import { randomUUID, createHash } from 'crypto';


// Deterministic UUID (v4-shaped) for Qdrant — forces RFC 4122 version=4 and variant=1 bits
function makeChunkId(productId: string, chunkType: string): string {
  const hash = createHash('sha256')
    .update(`${productId}:${chunkType}`)
    .digest('hex');
  // Force version nibble = '4' (bits 12-15 of time_hi_and_version)
  // Force variant nibble = '8' (10xxxxxx — variant 1)
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16),        // version 4
    (parseInt(hash[16], 16) & 0x3 | 0x8).toString(16) + hash.slice(17, 20), // variant 10xx
    hash.slice(20, 32),
  ].join('-');
}

/**
 * Chunk 1: metadata — title + price + rating (NOT embedded, used as context)
 * Chunk 2: specs — full specs block → EMBEDDED
 * Chunk 3: reviews — top 5 reviews concatenated → EMBEDDED separately
 */
export function chunkProduct(product: UnifiedProduct): ProductChunk[] {
  const chunks: ProductChunk[] = [];

  // Chunk 1: Metadata (not embedded, but stored for context injection)
  const metadataContent = [
    `Product: ${product.title}`,
    `Price: ₹${product.price_inr.toLocaleString('en-IN')}`,
    `Rating: ${product.rating}/5 (${product.review_count} reviews)`,
    `Source: ${product.source}`,
    `Category: ${product.category}`,
  ].join('\n');

  chunks.push({
    id: makeChunkId(product.id, 'metadata'),
    product_id: product.id,
    chunk_type: 'metadata',
    content: metadataContent,
    source: product.source,
    price_inr: product.price_inr,
    category: product.category,
  });

  // Chunk 2: Specs block (embedded for semantic search)
  const specsLines = Object.entries(product.specs).map(
    ([key, value]) => `${key}: ${value}`
  );
  const specsContent = [
    `Specifications for ${product.title}:`,
    ...specsLines,
  ].join('\n');

  chunks.push({
    id: makeChunkId(product.id, 'specs'),
    product_id: product.id,
    chunk_type: 'specs',
    content: specsContent,
    source: product.source,
    price_inr: product.price_inr,
    category: product.category,
  });

  // Chunk 3: Reviews (embedded separately for sentiment/feature queries)
  if (product.reviews.length > 0) {
    const reviewsContent = [
      `Customer reviews for ${product.title}:`,
      ...product.reviews.slice(0, 5).map((r, i) => `Review ${i + 1}: ${r}`),
    ].join('\n');

    chunks.push({
      id: makeChunkId(product.id, 'reviews'),
      product_id: product.id,
      chunk_type: 'reviews',
      content: reviewsContent,
      source: product.source,
      price_inr: product.price_inr,
      category: product.category,
    });
  }

  return chunks;
}

/**
 * Chunk multiple products at once.
 */
export function chunkProducts(products: UnifiedProduct[]): ProductChunk[] {
  return products.flatMap(chunkProduct);
}

/**
 * Get MD5 hash of text content (used for embedding cache keys).
 */
export function getContentHash(content: string): string {
  return createHash('md5').update(content).digest('hex');
}
