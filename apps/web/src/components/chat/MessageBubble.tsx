// ─── Message Bubble ──────────────────────────────────────────────────────────

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';
import type { DisplayMessage } from '../../lib/types';
import { formatIntent } from '../../lib/formatters';

interface MessageBubbleProps {
  message: DisplayMessage;
  isStreaming?: boolean;
  streamingContent?: string;
}

export default function MessageBubble({ message, isStreaming, streamingContent }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const content = isStreaming ? (streamingContent ?? '') : message.content;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1
                    ${isUser ? 'bg-[var(--chat-elevated)] text-[var(--chat-text)]' : 'bg-[#FFFFFF] text-[var(--chat-text)] border border-[var(--chat-border)] shadow-[0_1px_4px_rgba(29,28,28,0.05)]'}`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] min-w-0 px-4 py-3 
                    ${isUser
                      ? 'bg-[var(--chat-elevated)] text-[var(--chat-text)] border border-[rgba(29,28,28,0.08)]'
                      : 'bg-[#FFFFFF] text-[var(--chat-text)] border border-[var(--chat-border)] shadow-[0_1px_4px_rgba(29,28,28,0.05)]'
                    }`}
        style={{ borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }}
      >
        {/* Intent badge for assistant */}
        {!isUser && message.intent && (
          <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-[10px] font-medium
                          bg-[var(--chat-card)] text-[var(--chat-text)] border border-[var(--chat-border)]">
            {formatIntent(message.intent)}
          </span>
        )}

        {/* Content */}
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none
                          prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5
                          prose-li:my-0.5 prose-headings:my-2
                          prose-strong:text-[var(--chat-text)] prose-a:text-[var(--bg-pink)]
                          prose-code:text-[var(--bg-pink)] prose-code:bg-[var(--chat-card)] prose-code:px-1 prose-code:rounded">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || ' '}
            </ReactMarkdown>
            {/* Blinking cursor during streaming */}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-[var(--chat-text-muted)] rounded-sm animate-blink ml-0.5 align-middle" />
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-[var(--chat-text-muted)] text-right' : 'text-[var(--chat-text-muted)]'}`}>
          {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
