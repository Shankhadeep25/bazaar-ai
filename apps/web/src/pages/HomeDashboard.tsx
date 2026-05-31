import { useNavigate } from 'react-router-dom';
import { signOut } from '../lib/authClient';
import Footer from '../components/layout/Footer';

const CATEGORIES = [
  { id: 'smartphones', name: 'Smartphones', emoji: '📱' },
  { id: 'laptops', name: 'Laptops & PCs', emoji: '💻' },
  { id: 'audio', name: 'Headphones & Audio', emoji: '🎧' },
  { id: 'cameras', name: 'Cameras', emoji: '📷' },
  { id: 'wearables', name: 'Smartwatches', emoji: '⌚' },
  { id: 'gaming', name: 'Gaming Consoles', emoji: '🎮' },
  { id: 'home', name: 'Smart Home', emoji: '🏠' },
];

export default function HomeDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div data-bg="#FFFFFF" className="min-h-screen bg-[#FFFFFF] flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-[#FAFAFA] border-b border-[rgba(29,28,28,0.08)] shadow-[0_4px_16px_rgba(29,28,28,0.04)] relative z-10">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-[var(--bg-pink)]">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="text-[var(--bg-pink)] text-2xl tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>SHOPSENSE</span>
        </div>
        <button
          onClick={handleLogout}
          className="btn-ghost"
        >
          Logout
        </button>
      </nav>

      {/* Category Marquee Strip */}
      <div className="w-full bg-[var(--bg-yellow)] overflow-hidden" style={{ borderTop: '1px solid rgba(29,28,28,0.12)', borderBottom: '1px solid rgba(29,28,28,0.12)', padding: '18px 0' }}>
        <div className="flex w-fit animate-[ticker_30s_linear_infinite] hover:[animation-play-state:paused]" style={{ whiteSpace: 'nowrap' }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-[48px] px-[24px]">
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 text-[#1D1C1C] text-[1rem] font-semibold">
                  <span className="text-xl">{cat.emoji}</span>
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main CTA Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-[60px_24px] bg-[#FFFFFF] min-h-[calc(100vh-140px)]">
        <div className="max-w-4xl w-full mx-auto flex flex-col items-center animate-on-scroll visible">
          <p className="text-[var(--text-muted)] text-[0.75rem] font-semibold tracking-[0.14em] uppercase mb-4">Start your search</p>
          <h1 className="text-[#1D1C1C] text-center" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3.5rem, 10vw, 9rem)", lineHeight: 0.92 }}>
            WHAT ARE YOU <br/>
            <span className="text-[var(--bg-pink)]">LOOKING</span> FOR?
          </h1>
          <p className="text-[var(--text-muted)] text-[1rem] mt-[16px] text-center max-w-lg">
            ShopSense connects you with the perfect products using AI. Describe your needs, set your budget, and let's go.
          </p>
          
          <button
            onClick={() => navigate('/chat')}
            className="btn-primary"
            style={{ marginTop: '40px' }}
          >
            Start Chat
          </button>
        </div>
      </main>
      <Footer />
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
