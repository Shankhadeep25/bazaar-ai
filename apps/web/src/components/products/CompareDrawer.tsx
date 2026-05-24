// ─── Compare Drawer ──────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { X, MessageSquare, Star } from 'lucide-react';
import type { CompareResponse } from '../../lib/types';
import { formatINR, formatRating } from '../../lib/formatters';

interface CompareDrawerProps {
  data: CompareResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onAskCompare: (productNames: string[]) => void;
}

export default function CompareDrawer({ data, isOpen, onClose, onAskCompare }: CompareDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const { products, specMatrix } = data;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-3xl h-full bg-surface border-l border-border
                      shadow-2xl shadow-black/50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary font-display">
            Compare Products
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-background transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
          <table className="w-full border-collapse min-w-[500px]">
            {/* Product header */}
            <thead>
              <tr className="sticky top-0 bg-surface z-10 border-b border-border">
                <th className="p-4 text-left text-xs font-medium text-muted w-1/5">
                  Specification
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-16 h-16 object-contain rounded-lg bg-background/50"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span className="text-xs font-medium text-primary line-clamp-2 leading-snug max-w-[150px]">
                        {product.title}
                      </span>
                      <span className="text-sm font-bold text-accent font-mono">
                        {formatINR(product.price_inr)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-muted">
                          {formatRating(product.rating)}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Spec rows */}
            <tbody>
              {specMatrix.map((row, idx) => {
                const values = row.values;
                const allSame = values.every((v) => v === values[0]);

                return (
                  <tr
                    key={row.spec}
                    className={`border-b border-border ${idx % 2 === 0 ? 'bg-background/20' : ''}`}
                  >
                    <td className="p-3 text-xs font-medium text-muted whitespace-nowrap">
                      {row.spec}
                    </td>
                    {values.map((value, vIdx) => (
                      <td
                        key={vIdx}
                        className={`p-3 text-xs text-center font-mono
                                   ${!allSame ? 'text-accent font-medium' : 'text-primary'}`}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => {
              onAskCompare(products.map((p) => p.title));
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                       bg-accent text-white hover:bg-accent/90 transition-all duration-200
                       text-sm font-medium active:scale-[0.98]"
          >
            <MessageSquare size={16} />
            Which one should I buy?
          </button>
        </div>
      </div>
    </div>
  );
}
