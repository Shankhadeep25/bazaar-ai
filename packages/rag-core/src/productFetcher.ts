// ─── Product Fetcher ─────────────────────────────────────────────────────────
// Interface + Mock implementation. Real Amazon/Flipkart fetchers can be swapped in.

import { ProductFetcher, ParsedQuery, UnifiedProduct } from './types';
import { MOCK_PRODUCTS } from './mockData';

export class MockProductFetcher implements ProductFetcher {
  async fetch(query: ParsedQuery): Promise<UnifiedProduct[]> {
    let results = [...MOCK_PRODUCTS];

    // Filter by category
    if (query.category !== 'general') {
      results = results.filter((p) => p.category === query.category);
    }

    // Filter by budget
    if (query.budget !== null) {
      const budget = query.budget;
      switch (query.budgetType) {
        case 'under':
          results = results.filter((p) => p.price_inr <= budget);
          break;
        case 'around':
          // ±20% range
          results = results.filter(
            (p) => p.price_inr >= budget * 0.8 && p.price_inr <= budget * 1.2
          );
          break;
        case 'exact':
          // ±10% range
          results = results.filter(
            (p) => p.price_inr >= budget * 0.9 && p.price_inr <= budget * 1.1
          );
          break;
        default:
          results = results.filter((p) => p.price_inr <= budget);
      }
    }

    // Filter by brands
    if (query.brands.length > 0) {
      const brandResults = results.filter((p) =>
        query.brands.some((brand) =>
          p.title.toLowerCase().includes(brand.toLowerCase())
        )
      );
      // If brand filter returns results, use them; otherwise keep all (user may want alternatives)
      if (brandResults.length > 0) {
        results = brandResults;
      }
    }

    // Sort by rating (descending), then by review count
    results.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.review_count - a.review_count;
    });

    // If no results after filtering, return top products from the category or all
    if (results.length === 0) {
      const fallback = query.category !== 'general'
        ? MOCK_PRODUCTS.filter((p) => p.category === query.category)
        : MOCK_PRODUCTS;
      return fallback.slice(0, 6);
    }

    return results.slice(0, 10);
  }
}
