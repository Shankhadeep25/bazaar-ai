import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

interface StaticPageProps {
  title: string;
  children: ReactNode;
}

export default function StaticPage({ title, children }: StaticPageProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans">
      {/* Basic Navbar for static pages */}
      <nav className="flex items-center justify-between px-6 py-4 bg-[#FAFAFA] border-b border-[rgba(29,28,28,0.08)] shadow-[0_4px_16px_rgba(29,28,28,0.04)] relative z-10">
        <Link to="/" className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-[var(--bg-pink)]">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="text-[var(--bg-pink)] text-2xl tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>SHOPSENSE</span>
        </Link>
        <Link to="/" className="btn-ghost">Back to Home</Link>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1D1C1C] mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          {title}
        </h1>
        <div className="prose max-w-none text-[#1D1C1C] leading-relaxed space-y-4">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
