// ─── Formatters ──────────────────────────────────────────────────────────────

/**
 * Format number in Indian Rupee format: ₹1,29,999
 */
export const formatINR = (n: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Format rating to 1 decimal place: 4.5
 */
export const formatRating = (rating: number): string => rating.toFixed(1);

/**
 * Format review count: 2,847 reviews
 */
export const formatReviewCount = (count: number): string =>
  `${count.toLocaleString('en-IN')} reviews`;

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength)}…`;

/**
 * Format timestamp to relative time: "2 min ago", "1 hr ago"
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/**
 * Generate a unique ID for display messages
 */
export const generateMessageId = (): string =>
  `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Capitalize first letter of intent for display
 */
export const formatIntent = (intent: string): string =>
  intent.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
