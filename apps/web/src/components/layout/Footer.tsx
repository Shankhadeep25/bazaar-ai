import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer data-bg="#FAFAFA" className="bg-[#FAFAFA] border-t border-[rgba(29,28,28,0.08)] py-12 px-6 lg:px-12 w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <div className="flex flex-col items-center md:items-start">
          <Link to="/" className="text-[var(--bg-pink)] text-3xl font-display uppercase tracking-tight mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            ShopSense
          </Link>
          <div className="flex gap-4 mb-4">
            <a href="#" className="text-[var(--text-muted)] hover:text-[var(--bg-pink)] transition-colors" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" className="text-[var(--text-muted)] hover:text-[var(--bg-pink)] transition-colors" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="#" className="text-[var(--text-muted)] hover:text-[var(--bg-pink)] transition-colors" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
          </div>
          <p className="text-[var(--text-muted)] text-sm">© 2026 ShopSense. All rights reserved.</p>
        </div>

        <div className="flex flex-wrap justify-center md:justify-end gap-12 text-sm font-medium">
          <div className="flex flex-col gap-3 items-center md:items-start">
            <Link to="/about" className="text-[#1D1C1C] hover:text-[var(--bg-pink)] transition-colors">About Us</Link>
            <Link to="/contact" className="text-[#1D1C1C] hover:text-[var(--bg-pink)] transition-colors">Contact Us</Link>
            <Link to="/faq" className="text-[#1D1C1C] hover:text-[var(--bg-pink)] transition-colors">FAQ</Link>
          </div>
          <div className="flex flex-col gap-3 items-center md:items-start">
            <Link to="/privacy" className="text-[#1D1C1C] hover:text-[var(--bg-pink)] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-[#1D1C1C] hover:text-[var(--bg-pink)] transition-colors">Terms & Conditions</Link>
            <Link to="/sitemap" className="text-[#1D1C1C] hover:text-[var(--bg-pink)] transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
