// ─── Suggested Prompts ───────────────────────────────────────────────────────

import {
  Laptop, Headphones, GitCompareArrows, Camera,
  Smartphone, Tablet, Gamepad2, BatteryFull,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  { text: 'Best laptop under ₹60k for video editing', icon: Laptop },
  { text: 'Noise cancelling headphones under ₹30k', icon: Headphones },
  { text: 'Compare OnePlus 12 and Samsung S24 Ultra', icon: GitCompareArrows },
  { text: 'Budget phone with best camera under ₹25k', icon: Camera },
  { text: 'Sony headphones vs AirPods Pro — which is better?', icon: Headphones },
  { text: 'Tablet for college students under ₹55k', icon: Tablet },
  { text: 'Gaming laptop with RTX 4060', icon: Gamepad2 },
  { text: 'Best phone for battery life', icon: BatteryFull },
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto px-4">
      {SUGGESTED_PROMPTS.map((prompt) => {
        const Icon = prompt.icon;
        return (
          <button
            key={prompt.text}
            onClick={() => onSelect(prompt.text)}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl
                       bg-surface/50 border border-border hover:border-accent/50
                       hover:bg-accent/5 transition-all duration-200
                       text-left text-sm text-muted hover:text-primary"
          >
            <span className="shrink-0 p-2 rounded-lg bg-accent/10 text-accent
                            group-hover:bg-accent/20 transition-colors">
              <Icon size={16} />
            </span>
            <span className="line-clamp-2">{prompt.text}</span>
          </button>
        );
      })}
    </div>
  );
}

// Also export prompts for landing page input cycling
export { SUGGESTED_PROMPTS };
export function SmartphoneIcon() {
  return <Smartphone size={16} />;
}
