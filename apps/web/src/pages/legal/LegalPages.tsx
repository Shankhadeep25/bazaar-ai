import { Link } from 'react-router-dom';
import StaticPage from '../StaticPage';

export function AboutUsPage() {
  return (
    <StaticPage title="About Us">
      <p>Welcome to ShopSense! We are building the future of e-commerce discovery.</p>
      <p>Our mission is to connect you with the perfect products using natural language and advanced AI, so you never have to endlessly scroll through irrelevant search results again.</p>
    </StaticPage>
  );
}

export function ContactUsPage() {
  return (
    <StaticPage title="Contact Us">
      <p>Have questions, feedback, or need support? We'd love to hear from you.</p>
      <p>Email us at: <strong>support@shopsense.com</strong></p>
    </StaticPage>
  );
}

export function FAQPage() {
  return (
    <StaticPage title="Frequently Asked Questions">
      <h3 className="text-xl font-bold mt-6 mb-2">Is ShopSense free to use?</h3>
      <p>Yes, the core product search and chat features are completely free for shoppers.</p>
      <h3 className="text-xl font-bold mt-6 mb-2">How does the AI work?</h3>
      <p>We use advanced Language Models to understand your natural language queries, and vector embeddings to match those queries against thousands of product specifications in real time.</p>
    </StaticPage>
  );
}

export function PrivacyPolicyPage() {
  return (
    <StaticPage title="Privacy Policy">
      <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your data.</p>
      <p>We do not sell your personal data to third parties. We only use your chat history to provide context for your active shopping session.</p>
    </StaticPage>
  );
}

export function TermsConditionsPage() {
  return (
    <StaticPage title="Terms & Conditions">
      <p>By using ShopSense, you agree to these terms and conditions.</p>
      <p>ShopSense is a discovery platform. Any purchases made via affiliate links are subject to the respective retailer's terms of service (e.g. Amazon, Flipkart).</p>
    </StaticPage>
  );
}

export function SitemapPage() {
  return (
    <StaticPage title="Sitemap">
      <ul className="list-disc pl-6 space-y-2">
        <li><Link to="/" className="text-[var(--bg-pink)] hover:underline">Home</Link></li>
        <li><Link to="/login" className="text-[var(--bg-pink)] hover:underline">Login / Signup</Link></li>
        <li><Link to="/about" className="text-[var(--bg-pink)] hover:underline">About Us</Link></li>
        <li><Link to="/contact" className="text-[var(--bg-pink)] hover:underline">Contact Us</Link></li>
        <li><Link to="/faq" className="text-[var(--bg-pink)] hover:underline">FAQ</Link></li>
        <li><Link to="/privacy" className="text-[var(--bg-pink)] hover:underline">Privacy Policy</Link></li>
        <li><Link to="/terms" className="text-[var(--bg-pink)] hover:underline">Terms & Conditions</Link></li>
      </ul>
    </StaticPage>
  );
}
