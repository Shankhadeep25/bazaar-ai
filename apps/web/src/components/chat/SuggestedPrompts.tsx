// ─── Suggested Prompts ───────────────────────────────────────────────────────

import {
  Laptop, Headphones, Smartphone, Gamepad2, BatteryFull,
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
            className="flex-shrink-0 flex items-center gap-2 px-[18px] py-[8px] rounded-full
                       bg-[#FFFFFF] border border-[var(--chat-border)] hover:bg-[var(--chat-card)] hover:border-[var(--border-strong)]
                       transition-all duration-200 text-[0.82rem] text-[var(--chat-text)] shadow-[0_1px_4px_rgba(29,28,28,0.06)] whitespace-nowrap"
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
