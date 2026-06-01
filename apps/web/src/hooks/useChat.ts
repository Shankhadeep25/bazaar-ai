// ─── useChat Hook ────────────────────────────────────────────────────────────
// Re-exports context for convenience + session restoration on mount

import { useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import { getSession } from '../lib/api';
import type { DisplayMessage, SavedSession } from '../lib/types';

export function useChat() {
  const ctx = useChatContext();

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('shopsense_session_id');

    // Restore saved sessions list for sidebar
    try {
      const sessions = JSON.parse(localStorage.getItem('shopsense_sessions') ?? '[]') as SavedSession[];
      if (sessions.length > 0) {
        ctx.dispatch({ type: 'SET_SAVED_SESSIONS', payload: sessions });
      }
    } catch {
      // Ignore parse errors
    }

    if (!savedSessionId) return;

    // Validate and restore session
    getSession(savedSessionId)
      .then((data) => {
        ctx.dispatch({ type: 'SET_SESSION_ID', payload: savedSessionId });

        if (data.chatHistory.length > 0) {
          const restoredMessages: DisplayMessage[] = data.chatHistory.map((turn, idx) => ({
            id: `restored-${idx}`,
            role: turn.role,
            content: turn.content,
            timestamp: new Date(turn.timestamp),
            intent: (turn.intent || undefined) as DisplayMessage['intent'],
            products: turn.products,
          }));
          ctx.dispatch({ type: 'RESTORE_MESSAGES', payload: restoredMessages });
        }
      })
      .catch(() => {
        // Session expired or not found — clear and start fresh
        localStorage.removeItem('shopsense_session_id');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...ctx.state,
    sendMessage: ctx.sendMessage,
    stopStreaming: ctx.stopStreaming,
    startNewChat: ctx.startNewChat,
    dispatch: ctx.dispatch,
  };
}
