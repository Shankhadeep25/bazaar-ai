// ─── Product Card ────────────────────────────────────────────────────────────

import { Star, ExternalLink, GitCompareArrows } from 'lucide-react';
import type { UnifiedProduct } from '../../lib/types';
import { formatINR, formatRating, formatReviewCount } from '../../lib/formatters';

interface ProductCardProps {
  product: UnifiedProduct;
  onCompareToggle: (id: string) => void;
  isInCompare: boolean;
  onViewDetail: (product: UnifiedProduct) => void;
  index?: number;
}

export default function ProductCard({
  product,
  onCompareToggle,
  isInCompare,
  onViewDetail,
  index = 0,
}: ProductCardProps) {
  const topSpecs = Object.entries(product.specs).slice(0, 2);

  return (
    <div
      className="group relative flex flex-col bg-surface border border-border rounded-2xl
                 overflow-hidden hover:border-accent/30 hover:-translate-y-0.5
                 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300
                 cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onViewDetail(product)}
    >
      {/* Source Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span
          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide
                     ${product.source === 'amazon'
                       ? 'bg-amazon/20 text-amazon'
                       : 'bg-flipkart/20 text-flipkart'
                     }`}
        >
          {product.source}
        </span>
      </div>

      {/* Image */}
      <div className="aspect-[4/3] bg-background/50 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.title}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.fallback-icon')) {
              const fallback = document.createElement('div');
              fallback.className = 'fallback-icon flex flex-col items-center gap-2 text-muted/30';
              fallback.innerHTML = '<div class="w-16 h-16"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>';
              parent.appendChild(fallback);
            }
          }}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 gap-3">
        {/* Title */}
        <h3 className="text-sm font-medium text-primary line-clamp-2 leading-snug">
          {product.title}
        </h3>

        {/* Price */}
        <p className="text-lg font-bold text-accent font-mono">
          {formatINR(product.price_inr)}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={
                  star <= Math.round(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-none text-muted/30'
                }
              />
            ))}
          </div>
          <span className="text-xs text-muted">
            {formatRating(product.rating)}
          </span>
          <span className="text-[10px] text-muted/50">
            ({formatReviewCount(product.review_count)})
          </span>
        </div>

        {/* Spec Pills */}
        <div className="flex flex-wrap gap-1.5">
          {topSpecs.map(([key, value]) => (
            <span
              key={key}
              className="px-2 py-0.5 rounded-md text-[10px] bg-accent/5 text-muted
                         border border-border"
            >
              {key}: {value}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompareToggle(product.id);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                        text-xs font-medium transition-all duration-200
                        ${isInCompare
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'bg-surface border border-border text-muted hover:border-accent/30 hover:text-accent'
                        }`}
          >
            <GitCompareArrows size={13} />
            {isInCompare ? 'Selected' : 'Compare'}
          </button>

          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                       text-xs font-medium bg-accent text-white hover:bg-accent/90
                       transition-all duration-200 active:scale-95"
          >
            Buy <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-border/30" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-border/30 rounded w-3/4" />
        <div className="h-4 bg-border/30 rounded w-1/2" />
        <div className="h-6 bg-border/30 rounded w-1/3" />
        <div className="flex gap-2">
          <div className="h-5 bg-border/30 rounded flex-1" />
          <div className="h-5 bg-border/30 rounded flex-1" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-border/30 rounded flex-1" />
          <div className="h-8 bg-border/30 rounded flex-1" />
        </div>
      </div>
    </div>
  );
}
