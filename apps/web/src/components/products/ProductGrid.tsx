// ─── Product Grid ────────────────────────────────────────────────────────────

import { GitCompareArrows } from 'lucide-react';
import type { UnifiedProduct } from '../../lib/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: UnifiedProduct[];
  compareList: string[];
  onCompareToggle: (id: string) => void;
  onViewDetail: (product: UnifiedProduct) => void;
  onCompareSelected: () => void;
}

export default function ProductGrid({
  products,
  compareList,
  onCompareToggle,
  onViewDetail,
  onCompareSelected,
}: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="border-t border-border bg-background/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-primary">
          Products Found
          <span className="ml-2 text-xs text-muted font-normal">({products.length})</span>
        </h3>

        {compareList.length >= 2 && (
          <button
            onClick={onCompareSelected}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
                       bg-accent text-white hover:bg-accent/90 transition-all duration-200
                       animate-fade-in active:scale-95"
          >
            <GitCompareArrows size={14} />
            Compare ({compareList.length})
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="p-4 overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onCompareToggle={onCompareToggle}
              isInCompare={compareList.includes(product.id)}
              onViewDetail={onViewDetail}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
