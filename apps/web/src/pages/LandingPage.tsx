import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const titleText = "Shop Smarter with AI";
  const titleWords = titleText.split(' ');

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className={`landing-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="landing-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          ShopSense
        </Link>
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-btn landing-btn-ghost">Log In</Link>
          <Link to="/signup" className="landing-btn landing-btn-primary">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero-bg">
          <div className="landing-orb"></div>
        </div>
        <div className="landing-hero-content">
          <h1 className="landing-title">
            {titleWords.map((word, index) => (
              <span 
                key={index} 
                className="landing-title-word"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {word}
              </span>
            ))}
          </h1>
          <p className="landing-subtitle">
            Describe what you want in plain English. ShopSense finds it, explains it, and answers your follow-up questions — like a knowledgeable friend who knows every product.
          </p>
          <div className="landing-hero-ctas">
            <Link to="/signup" className="landing-btn landing-btn-primary">
              Get Started Free
            </Link>
            <a href="#features" onClick={scrollToFeatures} className="landing-btn landing-btn-ghost">
              See How It Works
            </a>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="landing-features-header">
          <h2 className="landing-features-title">Everything you need to shop with confidence</h2>
        </div>
        <div className="landing-features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="landing-feature-card"
              ref={(el) => { featureRefs.current[index] = el; }}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="landing-feature-icon">{feature.icon}</div>
              <h3 className="landing-feature-title">{feature.title}</h3>
              <p className="landing-feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TODO: Footer */}
    </div>
  );
}
