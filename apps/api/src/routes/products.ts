// ─── Products Route ──────────────────────────────────────────────────────────

import { Router, Request, Response } from 'express';
import { parseQuery, MockProductFetcher, MOCK_PRODUCTS, UnifiedProduct } from '@shopsense/rag-core';
import { createAppError } from '../middleware/errorHandler';

const router = Router();
const fetcher = new MockProductFetcher();

/**
 * GET /api/products?query=best laptop under 60k
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    if (!query) {
      throw createAppError('query parameter is required', 400);
    }

    const parsed = parseQuery(query);
    const products = await fetcher.fetch(parsed);

    res.json({
      success: true,
      data: {
        products,
        parsed,
        count: products.length,
      },
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/products/:id
 */
router.get('/:id', (req: Request, res: Response) => {
  const product = MOCK_PRODUCTS.find((p: UnifiedProduct) => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  res.json({ success: true, data: product });
});

/**
 * POST /api/products/compare
 * Body: { productIds: string[] }
 */
router.post('/compare', (req: Request, res: Response) => {
  const { productIds } = req.body;
  if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
    res.status(400).json({
      success: false,
      error: 'At least 2 productIds are required',
    });
    return;
  }

  const products = productIds
    .map((id: string) => MOCK_PRODUCTS.find((p: UnifiedProduct) => p.id === id))
    .filter((p): p is UnifiedProduct => Boolean(p));

  if (products.length < 2) {
    res.status(404).json({ success: false, error: 'Not enough products found' });
    return;
  }

  // Build comparison table
  const allSpecKeys = new Set<string>();
  products.forEach((p: UnifiedProduct) => {
    Object.keys(p.specs).forEach((k) => allSpecKeys.add(k));
  });

  const comparison = {
    products,
    specKeys: Array.from(allSpecKeys),
    specMatrix: Array.from(allSpecKeys).map((key) => ({
      spec: key,
      values: products.map((p: UnifiedProduct) => (p.specs[key] || 'N/A')),
    })),
  };

  res.json({ success: true, data: comparison });
});

export default router;
