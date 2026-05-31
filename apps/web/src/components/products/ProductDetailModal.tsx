// ─── Product Detail Modal ────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { X, ExternalLink, Star, MessageSquare } from 'lucide-react';
import type { UnifiedProduct } from '../../lib/types';
import { formatINR, formatRating, formatReviewCount } from '../../lib/formatters';

interface ProductDetailModalProps {
  product: UnifiedProduct | null;
  onClose: () => void;
  onAskAbout: (productTitle: string) => void;
}

export default function ProductDetailModal({ product, onClose, onAskAbout }: ProductDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (product) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product) return null;

  const specEntries = Object.entries(product.specs);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#FFFFFF] border border-[var(--chat-border)]
                      rounded-[16px] shadow-[0_8px_32px_rgba(29,28,28,0.12)] overflow-hidden animate-scale-in flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-[var(--chat-elevated)]
                     text-[var(--chat-text)] hover:bg-[#D8D7D5] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 scrollbar-chat">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 p-6 border-b border-[var(--chat-border)]">
            {/* Image */}
            <div className="shrink-0 w-full sm:w-40 h-40 bg-[var(--chat-card)] rounded-[12px]
                           flex items-center justify-center overflow-hidden border border-[var(--chat-border)]">
              <img
                src={product.image_url}
                alt={product.title}
                className="max-h-full max-w-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase mb-2
                           ${product.source === 'amazon' ? 'bg-amazon/20 text-amazon' : 'bg-flipkart/20 text-flipkart'}`}
              >
                {product.source}
              </span>
              <h2 className="text-lg font-semibold text-[#1D1C1C] leading-snug mb-2">
                {product.title}
              </h2>
              <p className="text-2xl font-bold text-[#1D1C1C] font-mono mb-2">
                {formatINR(product.price_inr)}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= Math.round(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-none text-muted/30'}
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--text-muted)]">
                  {formatRating(product.rating)} · {formatReviewCount(product.review_count)}
                </span>
              </div>
            </div>
          </div>

          {/* Specs Table */}
          <div className="p-6 border-b border-[var(--chat-border)]">
            <h3 className="text-sm font-semibold text-[#1D1C1C] mb-3">Specifications</h3>
            <div className="rounded-[12px] border border-[var(--chat-border)] overflow-hidden">
              {specEntries.map(([key, value], idx) => (
                <div
                  key={key}
                  className={`flex ${idx % 2 === 0 ? 'bg-[var(--chat-card)]' : 'bg-[#FFFFFF]'}`}
                >
                  <div className="w-1/3 px-4 py-2.5 text-xs font-medium text-[var(--text-muted)] border-r border-[var(--chat-border)]">
                    {key}
                  </div>
                  <div className="flex-1 px-4 py-2.5 text-xs text-[#1D1C1C] font-mono">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {product.reviews.length > 0 && (
            <div className="p-6">
              <h3 className="text-sm font-semibold text-[#1D1C1C] mb-3">
                Customer Reviews ({product.reviews.length})
              </h3>
              <div className="space-y-3">
                {product.reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[12px] bg-[var(--chat-card)] border border-[var(--chat-border)] text-xs text-[var(--text-muted)] leading-relaxed"
                  >
                    "{review}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center gap-3 p-4 border-t border-[var(--chat-border)] bg-[#FFFFFF]">
          <button
            onClick={() => {
              onAskAbout(product.title);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full
                       bg-[var(--chat-elevated)] text-[var(--chat-text)] border border-[var(--chat-border)]
                       hover:bg-[#D8D7D5] transition-colors text-sm font-medium"
          >
            <MessageSquare size={16} />
            Ask about this
          </button>

          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full
                       bg-[var(--bg-pink)] text-[#FFFFFF] hover:opacity-90 transition-opacity
                       text-sm font-medium active:scale-[0.98]"
          >
            Buy on {product.source === 'amazon' ? 'Amazon' : 'Flipkart'}
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
