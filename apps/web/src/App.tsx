// ─── App Entry ───────────────────────────────────────────────────────────────

import { ChatProvider } from './context/ChatContext';
import ChatWindow from './components/chat/ChatWindow';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <ChatProvider>
      <ChatWindow />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111118',
            border: '1px solid #1E1E2E',
            color: '#F0F0F5',
            fontSize: '13px',
          },
        }}
        richColors
      />
    </ChatProvider>
  );
}
