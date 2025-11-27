import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserIcon } from './Icons';

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 14L32.66 19V29L24 34L15.34 29V19L24 14Z" stroke="#0d0d0d" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M32.66 19C37 16 43 19 43 26" stroke="#10a37f" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M32.66 29C37 32 43 29 43 22" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M15.34 29C11 32 5 29 5 22" stroke="#10a37f" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M15.34 19C11 16 5 19 5 26" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span className="text-lg font-semibold text-gray-900">Keju</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/how-it-works" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/how-it-works' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                How it works
              </Link>
              <Link 
                to="/subscription" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/subscription' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Pricing
              </Link>
            </nav>
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="User menu"
            >
              <UserIcon className="w-5 h-5" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-fade-in">
                <Link 
                  to="/login" 
                  onClick={() => setDropdownOpen(false)} 
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
