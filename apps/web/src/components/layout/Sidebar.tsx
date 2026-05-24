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
                    bg-surface border-r border-border transition-transform duration-300
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500
                           flex items-center justify-center">
              <span className="text-white text-sm font-bold font-display">S</span>
            </div>
            <span className="font-semibold text-primary font-display text-sm">ShopSense</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-primary
                       hover:bg-background transition-colors lg:hidden"
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
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl
                       border border-dashed border-border text-sm text-muted
                       hover:border-accent/50 hover:text-accent hover:bg-accent/5
                       transition-all duration-200"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
          {sessions.length === 0 ? (
            <p className="text-xs text-muted/50 text-center py-8">No conversations yet</p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer
                              transition-all duration-200
                              ${activeSessionId === session.sessionId
                                ? 'bg-accent/10 border border-accent/20 text-accent'
                                : 'hover:bg-background text-muted hover:text-primary border border-transparent'
                              }`}
                  onClick={() => onSelectSession(session.sessionId)}
                >
                  <MessageSquare size={14} className="shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {truncate(session.title, 40)}
                    </p>
                    <p className="text-[10px] opacity-50 mt-0.5">
                      {formatRelativeTime(session.lastActiveAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.sessionId);
                    }}
                    className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100
                               text-muted hover:text-coral transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-[10px] text-muted/40 text-center">
            Powered by RAG + Gemini + Groq
          </p>
        </div>
      </aside>
    </>
  );
}
