// ─── Chat Context ────────────────────────────────────────────────────────────

import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import type { DisplayMessage, UnifiedProduct, Intent, SavedSession } from '../lib/types';
import { generateMessageId } from '../lib/formatters';
import { buildChatSSERequest } from '../lib/api';
import { streamChat } from '../lib/sseClient';
import { toast } from 'sonner';

// ─── State ───────────────────────────────────────────────────────────────────

interface ChatState {
  sessionId: string | null;
  messages: DisplayMessage[];
  products: UnifiedProduct[];
  streamingContent: string;
  isStreaming: boolean;
  intent: Intent | null;
  compareList: string[];
  savedSessions: SavedSession[];
  isSidebarOpen: boolean;
}

const initialState: ChatState = {
  sessionId: null,
  messages: [],
  products: [],
  streamingContent: '',
  isStreaming: false,
  intent: null,
  compareList: [],
  savedSessions: [],
  isSidebarOpen: false,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type ChatAction =
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'ADD_USER_MESSAGE'; payload: DisplayMessage }
  | { type: 'START_STREAMING' }
  | { type: 'APPEND_TOKEN'; payload: string }
  | { type: 'SET_PRODUCTS'; payload: UnifiedProduct[] }
  | { type: 'FINISH_STREAMING'; payload: { content: string; intent: Intent; products?: UnifiedProduct[] } }
  | { type: 'STOP_STREAMING' }
  | { type: 'TOGGLE_COMPARE'; payload: string }
  | { type: 'CLEAR_COMPARE' }
  | { type: 'RESET_CHAT' }
  | { type: 'RESTORE_MESSAGES'; payload: DisplayMessage[] }
  | { type: 'SET_SAVED_SESSIONS'; payload: SavedSession[] }
  | { type: 'ADD_SAVED_SESSION'; payload: SavedSession }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };

    case 'ADD_USER_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };

    case 'START_STREAMING':
      return { ...state, isStreaming: true, streamingContent: '' };

    case 'APPEND_TOKEN':
      return { ...state, streamingContent: state.streamingContent + action.payload };

    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };

    case 'FINISH_STREAMING': {
      const assistantMessage: DisplayMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: action.payload.content,
        timestamp: new Date(),
        intent: action.payload.intent,
        products: action.payload.products,
      };
      return {
        ...state,
        isStreaming: false,
        streamingContent: '',
        intent: action.payload.intent,
        messages: [...state.messages, assistantMessage],
        products: action.payload.products ?? state.products,
      };
    }

    case 'STOP_STREAMING': {
      if (state.streamingContent) {
        const partialMessage: DisplayMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: state.streamingContent,
          timestamp: new Date(),
        };
        return {
          ...state,
          isStreaming: false,
          streamingContent: '',
          messages: [...state.messages, partialMessage],
        };
      }
      return { ...state, isStreaming: false, streamingContent: '' };
    }

    case 'TOGGLE_COMPARE': {
      const id = action.payload;
      const isIn = state.compareList.includes(id);
      const newList = isIn
        ? state.compareList.filter((x) => x !== id)
        : state.compareList.length < 4
        ? [...state.compareList, id]
        : state.compareList;
      if (!isIn && state.compareList.length >= 4) {
        toast.error('Maximum 4 products can be compared');
      }
      return { ...state, compareList: newList };
    }

    case 'CLEAR_COMPARE':
      return { ...state, compareList: [] };

    case 'RESET_CHAT':
      return { ...initialState, savedSessions: state.savedSessions, isSidebarOpen: state.isSidebarOpen };

    case 'RESTORE_MESSAGES':
      return { ...state, messages: action.payload };

    case 'SET_SAVED_SESSIONS':
      return { ...state, savedSessions: action.payload };

    case 'ADD_SAVED_SESSION': {
      const exists = state.savedSessions.some((s) => s.sessionId === action.payload.sessionId);
      if (exists) {
        return {
          ...state,
          savedSessions: state.savedSessions.map((s) =>
            s.sessionId === action.payload.sessionId ? action.payload : s
          ),
        };
      }
      return { ...state, savedSessions: [action.payload, ...state.savedSessions] };
    }

    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };

    case 'SET_SIDEBAR':
      return { ...state, isSidebarOpen: action.payload };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ChatContextValue {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (message: string) => Promise<void>;
  stopStreaming: () => void;
  startNewChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamedContentRef = useRef('');
  const streamedProductsRef = useRef<UnifiedProduct[] | undefined>(undefined);

  const sendMessage = useCallback(
    async (message: string) => {
      if (state.isStreaming) return;

      // Add user message to chat
      const userMessage: DisplayMessage = {
        id: generateMessageId(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_USER_MESSAGE', payload: userMessage });
      dispatch({ type: 'START_STREAMING' });

      // Reset refs
      streamedContentRef.current = '';
      streamedProductsRef.current = undefined;

      // Build history from last 6 turns (excluding the current user message)
      const history = state.messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }));

      // Create abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const { url, init } = buildChatSSERequest(
        state.sessionId ?? undefined,
        message,
        history,
        abortController.signal
      );

      try {
        await streamChat(url, init, {
          onSession: (sessionId) => {
            dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
            localStorage.setItem('shopsense_session_id', sessionId);

            // Save session for sidebar
            const savedSession: SavedSession = {
              sessionId,
              title: message.length > 50 ? message.slice(0, 50) + '…' : message,
              createdAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
            };
            dispatch({ type: 'ADD_SAVED_SESSION', payload: savedSession });

            // Persist sessions list
            const existing = JSON.parse(localStorage.getItem('shopsense_sessions') ?? '[]') as SavedSession[];
            const updated = [savedSession, ...existing.filter((s) => s.sessionId !== sessionId)].slice(0, 20);
            localStorage.setItem('shopsense_sessions', JSON.stringify(updated));
          },
          onToken: (token) => {
            streamedContentRef.current += token;
            dispatch({ type: 'APPEND_TOKEN', payload: token });
          },
          onProducts: (products) => {
            streamedProductsRef.current = products;
            dispatch({ type: 'SET_PRODUCTS', payload: products });
          },
          onDone: (intent) => {
            dispatch({
              type: 'FINISH_STREAMING',
              payload: {
                content: streamedContentRef.current,
                intent: intent as Intent,
                products: streamedProductsRef.current,
              },
            });
            abortControllerRef.current = null;
          },
          onError: (error) => {
            toast.error(error.message || 'Connection error');
            dispatch({ type: 'STOP_STREAMING' });
            abortControllerRef.current = null;
          },
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          dispatch({ type: 'STOP_STREAMING' });
        } else {
          const error = err instanceof Error ? err : new Error(String(err));
          toast.error(error.message || 'Failed to send message');
          dispatch({ type: 'STOP_STREAMING' });
        }
        abortControllerRef.current = null;
      }
    },
    [state.isStreaming, state.sessionId, state.messages]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    dispatch({ type: 'STOP_STREAMING' });
  }, []);

  const startNewChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    dispatch({ type: 'RESET_CHAT' });
    localStorage.removeItem('shopsense_session_id');
  }, []);

  return (
    <ChatContext.Provider value={{ state, dispatch, sendMessage, stopStreaming, startNewChat }}>
      {children}
    </ChatContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
