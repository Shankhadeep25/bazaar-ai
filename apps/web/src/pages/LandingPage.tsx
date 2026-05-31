import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

const features = [
  {
    title: 'Semantic Search',
    description: "Don't know the exact product name? Just describe what you need. Our AI understands natural language and surfaces the most relevant matches.",
    icon: '🔍',
  },
  {
    title: 'RAG-Powered Chat',
    description: 'Ask follow-up questions, compare two products, or get clarifications — all in a streaming conversation powered by Google Gemini.',
    icon: '💬',
  },
  {
    title: 'Real-Time Streaming',
    description: 'Responses stream token-by-token via Server-Sent Events so you never wait for a wall of text.',
    icon: '⚡',
  },
  {
    title: 'Built for Indian E-Commerce',
    description: 'Trained and tuned for the Indian market — product names, pricing context, and regional availability all factor in.',
    icon: '🛍️',
  },
  {
    title: 'Secure Auth',
    description: 'Sign in with Email/Password or Google OAuth. Sessions are protected with HttpOnly cookies and managed by Better Auth.',
    icon: '🔐',
  },
  {
    title: 'Smart Intent Detection',
    description: "ShopSense automatically detects whether you're starting fresh, comparing items, or asking a follow-up — and responds accordingly.",
    icon: '🧠',
  },
];

export default function LandingPage() {
  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'linear-gradient(145deg, #FF899D 0%, #FFF48D 100%)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-[#FAFAFA] border-b border-[rgba(29,28,28,0.08)] shadow-[0_4px_16px_rgba(29,28,28,0.04)]">
        <Link to="/" className="nav-link flex items-center gap-2 text-[var(--bg-pink)] text-2xl font-display uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          ShopSense
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="btn-ghost">Log In</Link>
          <Link to="/signup" className="btn-primary">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section data-bg="linear-gradient(145deg, #FF899D 0%, #FFF48D 100%)" className="relative flex-1 flex flex-col items-center justify-center text-center" style={{ padding: 'clamp(80px,12vw,140px) clamp(24px,6vw,80px)', marginTop: '80px', background: 'transparent' }}>
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center hero-content">
          <h1 className="text-[#1D1C1C]" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(5rem, 13vw, 11rem)", lineHeight: 0.9 }}>
            SHOP SMARTER <br/>
            WITH <span className="text-[var(--bg-pink)]">AI</span>
          </h1>
          <p className="text-[var(--text-muted)] mt-6 max-w-[520px] mx-auto text-[1.1rem] leading-[1.6]">
            Describe what you want in plain English. ShopSense finds it, explains it, and answers your follow-up questions — like a knowledgeable friend who knows every product.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full">
            <Link to="/signup" className="btn-primary">
              Get Started
            </Link>
            <a href="#features" onClick={scrollToFeatures} className="btn-secondary">
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* Horizontal Ticker Strip */}
      <section data-bg="#FFF48D" className="w-full bg-[var(--bg-yellow)] overflow-hidden py-[14px]" style={{ borderTop: '1px solid rgba(29,28,28,0.12)', borderBottom: '1px solid rgba(29,28,28,0.12)' }}>
        <div className="flex w-fit animate-[ticker_25s_linear_infinite] hover:[animation-play-state:paused]" style={{ whiteSpace: 'nowrap' }}>
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex items-center text-[#1D1C1C] font-semibold text-[0.85rem] tracking-[0.08em] whitespace-nowrap px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              ✦ SEMANTIC SEARCH &nbsp;&nbsp; ✦ RAG CHAT &nbsp;&nbsp; ✦ STREAMING AI &nbsp;&nbsp; ✦ INDIAN E-COMMERCE &nbsp;&nbsp; ✦ POWERED BY GEMINI &nbsp;&nbsp; ✦ VECTOR SEARCH &nbsp;&nbsp;
            </span>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" data-bg="#F5F0E8" className="bg-[var(--bg-cream)]" style={{ padding: 'clamp(60px,10vw,120px) clamp(24px,6vw,80px)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-[var(--text-muted)] text-[0.75rem] font-semibold tracking-[0.14em] uppercase mb-2">Capabilities</p>
            <h2 className="text-[#1D1C1C]" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 7vw, 7rem)" }}>Everything you need</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card bg-[#FFFFFF] border border-[var(--border)] rounded-[12px] p-[36px_28px] shadow-[0_2px_12px_rgba(29,28,28,0.06)] hover:shadow-[0_20px_48px_rgba(29,28,28,0.12)] hover:-translate-y-[6px] transition-all duration-300"
              >
                <div className="bg-[var(--bg-pink)] text-white w-[48px] h-[48px] rounded-[12px] flex items-center justify-center p-[12px] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-[#1D1C1C] font-semibold text-[1.1rem] mt-[16px]">{feature.title}</h3>
                <p className="text-[var(--text-muted)] leading-[1.6] text-[0.95rem] mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section data-bg="linear-gradient(145deg, #FF899D 0%, #FFF48D 100%)" style={{ padding: 'clamp(60px,10vw,120px) clamp(24px,6vw,80px)', background: 'transparent' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-[var(--text-muted)] text-[0.75rem] font-semibold tracking-[0.14em] uppercase mb-2">Process</p>
            <h2 className="text-[#1D1C1C]" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 7vw, 7rem)" }}>How It Works</h2>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
            <div className="step flex-1 px-4 lg:pr-8 border-b lg:border-b-0 lg:border-r border-[var(--border)] pb-8 lg:pb-0">
              <div className="text-[var(--bg-pink)] text-[5rem] leading-[1]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>01</div>
              <h3 className="text-[#1D1C1C] font-semibold text-[1.1rem] mt-4 mb-2">Search with Intent</h3>
              <p className="text-[var(--text-muted)] text-[0.95rem] leading-[1.6]">Type what you need in natural language. No exact keywords required.</p>
            </div>
            <div className="step flex-1 px-4 lg:px-8 border-b lg:border-b-0 lg:border-r border-[var(--border)] pb-8 lg:pb-0">
              <div className="text-[var(--bg-pink)] text-[5rem] leading-[1]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>02</div>
              <h3 className="text-[#1D1C1C] font-semibold text-[1.1rem] mt-4 mb-2">Review Matches</h3>
              <p className="text-[var(--text-muted)] text-[0.95rem] leading-[1.6]">Get highly relevant product matches powered by semantic vector search.</p>
            </div>
            <div className="step flex-1 px-4 lg:pl-8">
              <div className="text-[var(--bg-pink)] text-[5rem] leading-[1]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>03</div>
              <h3 className="text-[#1D1C1C] font-semibold text-[1.1rem] mt-4 mb-2">Ask Follow-ups</h3>
              <p className="text-[var(--text-muted)] text-[0.95rem] leading-[1.6]">Chat with the AI to refine your choices, compare items, and decide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section data-bg="#FF678B" className="bg-[var(--bg-pink)] text-center" style={{ padding: 'clamp(80px,12vw,140px) clamp(24px,6vw,80px)' }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-[#1D1C1C] mb-[40px]" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 8vw, 8rem)", lineHeight: 0.92 }}>
            READY TO UPGRADE YOUR SHOPPING?
          </h2>
          <Link to="/signup" className="btn-secondary">
            Join ShopSense Now
          </Link>
        </div>
      </section>
      
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
