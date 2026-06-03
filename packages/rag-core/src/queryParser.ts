// ─── Query Parser ────────────────────────────────────────────────────────────
// Extracts budget, category, and brand preferences from natural language queries.
// Examples: "best laptop under ₹60k for video editing" → { budget: 60000, category: 'laptop' }

import { ParsedQuery, ProductCategory } from './types';

// ─── Budget Extraction ──────────────────────────────────────────────────────

/**
 * Extracts budget from natural language.
 * Supports formats: ₹60k, 60k, ₹1.5L, 1.5 lakh, 60000, ₹60,000, "under 50 thousand"
 */
function extractBudget(query: string): { amount: number | null; type: 'under' | 'around' | 'exact' | null } {
  const q = query.toLowerCase().replace(/,/g, '');

  // Determine budget type
  let budgetType: 'under' | 'around' | 'exact' | null = null;
  if (/\b(under|below|less than|within|upto|up to|max|maximum|budget)\b/.test(q)) {
    budgetType = 'under';
  } else if (/\b(around|approx|approximately|near|about|roughly)\b/.test(q)) {
    budgetType = 'around';
  }

  // Pattern: ₹60k or 60k
  const kPattern = /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b/i;
  const kMatch = q.match(kPattern);
  if (kMatch) {
    return { amount: parseFloat(kMatch[1]) * 1000, type: budgetType || 'under' };
  }

  // Pattern: ₹1.5L or 1.5 lakh or 2L
  const lPattern = /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:l|lakh|lac)\b/i;
  const lMatch = q.match(lPattern);
  if (lMatch) {
    return { amount: parseFloat(lMatch[1]) * 100000, type: budgetType || 'under' };
  }

  // Pattern: "50 thousand" or "50 thousands"
  const thousandPattern = /(\d+(?:\.\d+)?)\s*thousands?\b/i;
  const thousandMatch = q.match(thousandPattern);
  if (thousandMatch) {
    return { amount: parseFloat(thousandMatch[1]) * 1000, type: budgetType || 'under' };
  }

  // Pattern: ₹60000 or Rs. 60000 or plain 5-6 digit number after currency
  const rawPattern = /(?:₹|rs\.?|inr)\s*(\d{4,7})\b/i;
  const rawMatch = q.match(rawPattern);
  if (rawMatch) {
    return { amount: parseInt(rawMatch[1], 10), type: budgetType || 'exact' };
  }

  // Pattern: standalone 5-6 digit number (likely a price)
  const standalonePattern = /\b(\d{5,7})\b/;
  const standaloneMatch = q.match(standalonePattern);
  if (standaloneMatch && budgetType) {
    return { amount: parseInt(standaloneMatch[1], 10), type: budgetType };
  }

  return { amount: null, type: null };
}

// ─── Category Detection ─────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<ProductCategory, RegExp> = {
  laptop: /\b(laptop|macbook|notebook|chromebook|ultrabook|thinkpad|gaming laptop)s?\b/i,
  phone: /\b(phone|mobile|smartphone|iphone|android phone|cell phone)s?\b/i,
  tablet: /\b(tablet|ipad|tab|galaxy tab)s?\b/i,
  headphones: /\b(headphone|earphone|earbud|earbuds|headset|airpod|TWS|neckband|over-ear|in-ear)s?\b/i,
  camera: /\b(camera|dslr|mirrorless|gopro|action cam|webcam|digital camera)s?\b/i,
  television: /\b(tv|television|smart tv|oled|qled|led tv)s?\b/i,
  smartwatch: /\b(smartwatch|smart watch|apple watch|fitness band|fitness tracker)(es|s)?\b/i,
  general: /(?!)/, // never matches — fallback only
};

function detectCategory(query: string): ProductCategory {
  for (const [category, regex] of Object.entries(CATEGORY_KEYWORDS)) {
    if (regex.test(query)) {
      return category as ProductCategory;
    }
  }
  return 'general';
}

// ─── Brand Extraction ───────────────────────────────────────────────────────

const KNOWN_BRANDS = [
  'apple', 'samsung', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'oppo', 'vivo',
  'asus', 'lenovo', 'hp', 'dell', 'acer', 'msi', 'sony', 'bose', 'jbl', 'sennheiser',
  'boat', 'noise', 'canon', 'nikon', 'fujifilm', 'google', 'pixel', 'nothing',
  'marshall', 'lg', 'mi', 'motorola', 'nokia', 'macbook', 'iphone', 'ipad',
];

function extractBrands(query: string): string[] {
  const q = query.toLowerCase();
  return KNOWN_BRANDS.filter((brand) => {
    const regex = new RegExp(`\\b${brand}\\b`, 'i');
    return regex.test(q);
  });
}

// ─── Main Parser ─────────────────────────────────────────────────────────────

export function parseQuery(query: string): ParsedQuery {
  const { amount, type } = extractBudget(query);
  const category = detectCategory(query);
  const brands = extractBrands(query);

  return {
    rawQuery: query,
    budget: amount,
    budgetType: type,
    category,
    brands,
  };
}
