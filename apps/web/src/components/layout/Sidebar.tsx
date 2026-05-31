// ─── Sidebar ─────────────────────────────────────────────────────────────────

import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import type { SavedSession } from '../../lib/types';
import { formatRelativeTime, truncate } from '../../lib/formatters';

interface SidebarProps {
  sessions: SavedSession[];
  activeSessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  isOpen,
  onClose,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 flex flex-col
                    bg-[var(--chat-card)] border-r border-[var(--chat-border)] transition-transform duration-300
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--chat-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--chat-elevated)]
                           flex items-center justify-center">
              <span className="text-[var(--chat-text)] text-sm font-bold font-display">S</span>
            </div>
            <span className="font-semibold text-[var(--chat-text)] font-display text-sm">ShopSense</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--chat-text-muted)] hover:text-[var(--chat-text)]
                       transition-colors lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-[10px]
                       border border-[var(--chat-border)] bg-[#FFFFFF] shadow-[0_1px_4px_rgba(29,28,28,0.06)]
                       text-sm text-[var(--chat-text)] hover:bg-[var(--chat-elevated)] hover:border-[var(--border-strong)]
                       transition-all duration-200"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-chat">
          {sessions.length === 0 ? (
            <p className="text-xs text-[var(--chat-text-muted)] text-center py-8">No conversations yet</p>
          ) : (
            <div className="space-y-1 mt-3">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer
                              transition-all duration-200
                              ${activeSessionId === session.sessionId
                                ? 'bg-[#FFFFFF] text-[var(--chat-text)] border-l-[2px] border-[#1D1C1C] shadow-[0_1px_4px_rgba(29,28,28,0.06)]'
                                : 'bg-transparent text-[var(--chat-text-muted)] hover:bg-[var(--chat-surface)] hover:text-[var(--chat-text)] border-l-[2px] border-transparent'
                              }`}
                  onClick={() => onSelectSession(session.sessionId)}
                >
                  <MessageSquare size={14} className="shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {truncate(session.title, 40)}
                    </p>
                    <p className="text-[10px] opacity-50 mt-0.5 text-[var(--chat-text-muted)]">
                      {formatRelativeTime(session.lastActiveAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.sessionId);
                    }}
                    className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100
                               text-[var(--chat-text-muted)] hover:text-[var(--bg-pink)] transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--chat-border)]">
          <p className="text-[0.72rem] text-[var(--chat-text-muted)] text-center">
            Powered by RAG + Gemini + Groq
          </p>
        </div>
      </aside>
    </>
  );
}
