// ─── Suggested Prompts ───────────────────────────────────────────────────────

import {
  Laptop, Headphones, GitCompareArrows, Camera,
  Smartphone, Tablet, Gamepad2, BatteryFull,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  { text: 'Best laptops under ₹50K', icon: Laptop },
  { text: 'Wireless earbuds', icon: Headphones },
  { text: 'Budget smartphones', icon: Smartphone },
  { text: 'Gaming chairs', icon: Gamepad2 },
  { text: 'Air fryers', icon: BatteryFull },
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 px-4 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {SUGGESTED_PROMPTS.map((prompt) => {
        return (
          <button
            key={prompt.text}
            onClick={() => onSelect(prompt.text)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full
                       bg-[rgba(124,58,237,0.2)] border border-[#7c3aed] hover:bg-[rgba(124,58,237,0.3)] 
                       transition-all duration-200 text-xs text-white whitespace-nowrap"
          >
            {prompt.text}
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
