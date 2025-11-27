import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Pricing', to: '/subscription' },
    ],
    legal: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
      { label: 'GDPR', to: '/gdpr' },
      { label: 'Cookies', to: '/cookies' },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Logo & Copyright */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 14L32.66 19V29L24 34L15.34 29V19L24 14Z" stroke="#0d0d0d" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M32.66 19C37 16 43 19 43 26" stroke="#10a37f" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M32.66 29C37 32 43 29 43 22" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M15.34 29C11 32 5 29 5 22" stroke="#10a37f" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M15.34 19C11 16 5 19 5 26" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span className="font-semibold text-gray-900">Keju</span>
            </Link>
            <p className="text-sm text-gray-500">
              © {currentYear} Keju. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            <div className="flex gap-6">
              {links.product.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex gap-6">
              {links.legal.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
