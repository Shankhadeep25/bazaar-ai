// ─── Product Grid ────────────────────────────────────────────────────────────

import type { UnifiedProduct } from '../../lib/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: UnifiedProduct[];
  compareList: string[];
  onCompareToggle: (id: string) => void;
  onViewDetail: (product: UnifiedProduct) => void;
}

export default function ProductGrid({
  products,
  compareList,
  onCompareToggle,
  onViewDetail,
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
