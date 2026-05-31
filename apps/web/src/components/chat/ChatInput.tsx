// ─── Chat Input ──────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, onStop, isStreaming, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isStreaming, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize textarea
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="relative flex items-end gap-2 p-3 bg-transparent rounded-xl">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Ask ShopSense anything…'}
          rows={1}
          autoFocus
          disabled={isStreaming}
          className="w-full resize-none rounded-[12px] bg-[var(--chat-card)] border border-[var(--chat-border)]
                     px-4 py-3 pr-12 text-sm text-[var(--chat-text)] placeholder:text-[var(--chat-text-muted)]
                     focus:outline-none focus:border-[rgba(29,28,28,0.30)] focus:ring-0
                     disabled:opacity-50 transition-all duration-200
                     scrollbar-chat"
          style={{ maxHeight: '120px' }}
        />
        <span className="absolute right-3 bottom-3 text-[10px] text-muted/40 pointer-events-none">
          {input.length > 0 && `${input.length}`}
        </span>
      </div>

      {isStreaming ? (
        <button
          onClick={onStop}
          className="shrink-0 p-3 rounded-[10px] bg-[var(--chat-elevated)] border border-[var(--chat-border)] text-[var(--chat-text)]
                     hover:bg-[#D8D7D5] transition-colors duration-200
                     animate-pulse"
          aria-label="Stop generating"
        >
          <Square size={18} fill="currentColor" />
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="shrink-0 p-3 rounded-[10px] bg-[var(--chat-elevated)] border border-[var(--chat-border)] text-[var(--chat-text)]
                     hover:bg-[#D8D7D5] transition-colors duration-200
                     flex items-center justify-center
                     disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      )}
    </div>
  );
}
