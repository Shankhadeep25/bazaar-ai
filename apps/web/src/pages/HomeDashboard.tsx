import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShoppingBag } from 'lucide-react';
import { signOut } from '../lib/authClient';

const CATEGORIES = [
  { icon: '📱', label: 'Electronics', color: 'rgba(59, 130, 246, 0.5)' }, // blue
  { icon: '🎧', label: 'Gadgets', color: 'rgba(168, 85, 247, 0.5)' }, // purple
  { icon: '👟', label: 'Fashion', color: 'rgba(236, 72, 153, 0.5)' }, // pink
  { icon: '🏠', label: 'Home & Kitchen', color: 'rgba(245, 158, 11, 0.5)' }, // amber
  { icon: '📚', label: 'Books', color: 'rgba(16, 185, 129, 0.5)' }, // emerald
  { icon: '🎮', label: 'Gaming', color: 'rgba(239, 68, 68, 0.5)' }, // red
  { icon: '💄', label: 'Beauty', color: 'rgba(217, 70, 239, 0.5)' }, // fuchsia
  { icon: '🧸', label: 'Toys & Kids', color: 'rgba(14, 165, 233, 0.5)' }, // sky
];

export default function HomeDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="h-screen w-full bg-[#0a0a0f] text-[#f1f5f9] overflow-hidden flex flex-col font-sans">
      {/* 🔝 NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-4 border-b"
           style={{
             background: 'rgba(255,255,255,0.04)',
             backdropFilter: 'blur(16px)',
             borderColor: 'rgba(255,255,255,0.08)'
           }}>
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-white" size={24} />
          <span className="text-xl font-bold tracking-tight">ShopSense</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </nav>

      {/* 🎠 REVOLVING CATEGORY CARDS */}
      <div className="relative w-full py-10 mt-6 overflow-hidden group">
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              display: flex;
              width: max-content;
              animation: marquee 35s linear infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .marquee-track {
                animation: none;
                flex-wrap: wrap;
                justify-content: center;
                width: 100%;
              }
            }
            .group:hover .marquee-track {
              animation-play-state: paused;
            }
          `}
        </style>
        
        <div className="marquee-track px-4 gap-5">
          {/* Render twice for seamless loop */}
          {[...CATEGORIES, ...CATEGORIES].map((cat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center shrink-0"
              style={{
                width: '180px',
                height: '96px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                boxShadow: `0 8px 32px ${cat.color}`,
              }}
              tabIndex={-1}
              aria-hidden="true"
            >
              <span className="text-4xl mb-1">{cat.icon}</span>
              <span className="text-[0.95rem] font-medium text-[#f1f5f9] tracking-wide">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 🌊 WAVY DECORATIVE DIVIDER */}
      <div className="w-full relative -mt-4 z-10 opacity-60 pointer-events-none">
        <svg viewBox="0 0 1440 120" className="w-full h-auto" preserveAspectRatio="none">
          <path 
            fill="rgba(124, 58, 237, 0.05)" 
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          ></path>
          <path 
            fill="rgba(37, 99, 235, 0.05)" 
            d="M0,96L80,85.3C160,75,320,53,480,53.3C640,53,800,75,960,80C1120,85,1280,75,1360,70.6L1440,67.2L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* ▶️ START CHAT BUTTON (Centered below wave) */}
      <div className="flex-1 flex flex-col items-center justify-center mt-2 px-4">
        <style>
          {`
            @keyframes pulse-gentle {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
            .animate-pulse-gentle {
              animation: pulse-gentle 2.5s ease-in-out infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .animate-pulse-gentle {
                animation: none;
              }
            }
          `}
        </style>
        <button
          onClick={() => navigate('/chat')}
          className="animate-pulse-gentle group relative flex items-center justify-center px-12 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          }}
        >
          {/* Subtle glow that intensifies on hover */}
          <div className="absolute inset-0 rounded-full bg-inherit blur-md opacity-40 group-hover:opacity-100 group-hover:blur-xl transition-all duration-300" style={{ zIndex: -1 }}></div>
          ＋ Start Chat
        </button>
        <p className="mt-4 text-[#94a3b8] text-[0.9rem] text-center max-w-sm">
          Tell ShopSense what you're looking for — in your own words.
        </p>
      </div>
    </div>
  );
}
