// ─── Chat Window ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Menu } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useProducts } from '../../hooks/useProducts';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import SuggestedPrompts, { SUGGESTED_PROMPTS } from './SuggestedPrompts';
import ProductGrid from '../products/ProductGrid';
import ProductDetailModal from '../products/ProductDetailModal';
import CompareDrawer from '../products/CompareDrawer';
import Sidebar from '../layout/Sidebar';
import type { UnifiedProduct, SavedSession } from '../../lib/types';
import { getSession, deleteSession } from '../../lib/api';
import { toast } from 'sonner';
import type { DisplayMessage } from '../../lib/types';

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500
                     flex items-center justify-center mt-1 shrink-0">
        <span className="text-white text-xs font-bold font-display">S</span>
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-surface border border-border">
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Animated Placeholder ────────────────────────────────────────────────────

function useAnimatedPlaceholder() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % SUGGESTED_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return SUGGESTED_PROMPTS[index].text;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ChatWindow() {
  const {
    sessionId,
    messages,
    products,
    streamingContent,
    isStreaming,
    compareList,
    savedSessions,
    isSidebarOpen,
    sendMessage,
    stopStreaming,
    startNewChat,
    dispatch,
  } = useChat();

  const { compareData, isCompareOpen, runCompare, closeCompare } = useProducts();
  const [detailProduct, setDetailProduct] = useState<UnifiedProduct | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const animatedPlaceholder = useAnimatedPlaceholder();

  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Find the last message with products for the grid
  const lastProductMessage = [...messages].reverse().find((m) => m.products && m.products.length > 0);
  const displayProducts = lastProductMessage?.products ?? (products.length > 0 ? products : []);

  const handleSend = (message: string) => {
    sendMessage(message);
  };

  const handleAskAbout = (title: string) => {
    sendMessage(`Tell me more about ${title}`);
  };

  const handleCompareAsk = (names: string[]) => {
    const q = names.length === 2
      ? `Which one should I buy: ${names[0]} or ${names[1]}?`
      : `Compare these and tell me which one to buy: ${names.join(', ')}`;
    sendMessage(q);
  };

  const handleSelectSession = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) {
      dispatch({ type: 'SET_SIDEBAR', payload: false });
      return;
    }

    try {
      const data = await getSession(selectedSessionId);
      dispatch({ type: 'RESET_CHAT' });
      dispatch({ type: 'SET_SESSION_ID', payload: selectedSessionId });
      localStorage.setItem('shopsense_session_id', selectedSessionId);

      if (data.chatHistory.length > 0) {
        const restoredMessages: DisplayMessage[] = data.chatHistory.map((turn, idx) => ({
          id: `restored-${idx}`,
          role: turn.role,
          content: turn.content,
          timestamp: new Date(turn.timestamp),
          intent: (turn.intent || undefined) as DisplayMessage['intent'],
        }));
        dispatch({ type: 'RESTORE_MESSAGES', payload: restoredMessages });
      }

      // Re-set saved sessions (they were cleared by RESET_CHAT logic)
      const sessions = JSON.parse(localStorage.getItem('shopsense_sessions') ?? '[]') as SavedSession[];
      dispatch({ type: 'SET_SAVED_SESSIONS', payload: sessions });
    } catch {
      toast.error('Failed to load session');
    }
    dispatch({ type: 'SET_SIDEBAR', payload: false });
  };

  const handleDeleteSession = async (sid: string) => {
    try {
      await deleteSession(sid);
      const sessions = JSON.parse(localStorage.getItem('shopsense_sessions') ?? '[]') as SavedSession[];
      const updated = sessions.filter((s) => s.sessionId !== sid);
      localStorage.setItem('shopsense_sessions', JSON.stringify(updated));
      dispatch({ type: 'SET_SAVED_SESSIONS', payload: updated });

      if (sid === sessionId) {
        startNewChat();
      }
    } catch {
      toast.error('Failed to delete session');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        sessions={savedSessions}
        activeSessionId={sessionId}
        isOpen={isSidebarOpen}
        onClose={() => dispatch({ type: 'SET_SIDEBAR', payload: false })}
        onNewChat={() => {
          startNewChat();
          dispatch({ type: 'SET_SIDEBAR', payload: false });
        }}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface/50 backdrop-blur-sm">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-background
                       transition-colors lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="p-2 rounded-lg text-muted hover:text-primary hover:bg-background transition-colors"
            >
              <Menu size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-purple-500
                           flex items-center justify-center lg:hidden">
              <span className="text-white text-xs font-bold font-display">S</span>
            </div>
            <h1 className="text-sm font-semibold text-primary font-display">ShopSense</h1>
          </div>

          <div className="ml-auto">
            {sessionId && (
              <span className="text-[10px] text-muted/40 font-mono hidden sm:block">
                Session: {sessionId.slice(0, 8)}…
              </span>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!hasMessages ? (
            /* ─── Empty / Landing State ───── */
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                               bg-gradient-to-br from-accent to-purple-500 mb-4 shadow-lg shadow-accent/20">
                  <Sparkles className="text-white" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-primary font-display mb-2">
                  Ask anything. Find everything.
                </h2>
                <p className="text-sm text-muted max-w-md">
                  Your AI shopping assistant for the Indian market. Describe what you need
                  and get personalized product recommendations instantly.
                </p>
              </div>
            </div>
          ) : (
            /* ─── Chat Thread ───── */
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-[120px]">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Streaming message (not yet finalized) */}
                {isStreaming && streamingContent && (
                  <MessageBubble
                    message={{
                      id: 'streaming',
                      role: 'assistant',
                      content: '',
                      timestamp: new Date(),
                    }}
                    isStreaming
                    streamingContent={streamingContent}
                  />
                )}

                {/* Typing indicator (waiting for first token) */}
                {isStreaming && !streamingContent && <TypingIndicator />}

                <div ref={chatEndRef} />
              </div>

              {/* Product grid (only if we have products to show) */}
              {displayProducts.length > 0 && (
                <ProductGrid
                  products={displayProducts}
                  compareList={compareList}
                  onCompareToggle={(id) => dispatch({ type: 'TOGGLE_COMPARE', payload: id })}
                  onViewDetail={setDetailProduct}
                  onCompareSelected={() => runCompare(compareList)}
                />
              )}
            </div>
          )}

          {/* Chat Input Container */}
          <div className="sticky bottom-0 w-full z-10 pt-2 bg-[rgba(10,10,15,0.8)] backdrop-blur-md border-t border-[rgba(255,255,255,0.05)]">
            <SuggestedPrompts onSelect={handleSend} />
            <div className="px-2 pb-2 pt-1 max-w-3xl mx-auto">
              <ChatInput
                onSend={handleSend}
                onStop={stopStreaming}
                isStreaming={isStreaming}
                placeholder="Ask me anything — 'wireless headphones under ₹2000'..."
              />
            </div>
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAskAbout={handleAskAbout}
      />

      {/* Compare Drawer */}
      <CompareDrawer
        data={compareData}
        isOpen={isCompareOpen}
        onClose={closeCompare}
        onAskCompare={handleCompareAsk}
      />
    </div>
  );
}
