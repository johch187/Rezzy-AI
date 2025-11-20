import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { UserIcon } from './Icons';

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileContext = useContext(ProfileContext);
  
  const location = useLocation();
  const isAppPage = !['/', '/login'].includes(location.pathname);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      <div className="mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-x-4">
          <Link to="/" className="flex items-center gap-2 text-slate-900">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-slate-900">
              {/* Main path with bigger loops */}
              <path d="M6 40 C 18 25, 12 45, 24 24 C 36 3, 30 23, 42 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Secondary path with bigger loops */}
              <path d="M10 32 C 16 20, 20 32, 24 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="40" r="2.5" fill="currentColor"/>
              <circle cx="10" cy="32" r="2.5" fill="currentColor"/>
              <circle cx="24" cy="24" r="2.5" fill="currentColor"/>
              <circle cx="42" cy="8" r="2.5" fill="currentColor"/>
            </svg>
            <span className="text-xl font-bold">Keju</span>
          </Link>
            <div className="hidden md:flex items-center space-x-6">
                <Link to="/how-it-works" className="text-sm font-medium text-slate-700 hover:text-brand-blue transition-colors duration-200">
                    How it works
                </Link>
                <Link to="/subscription" className="text-sm font-medium text-slate-700 hover:text-brand-blue transition-colors duration-200">
                    Pricing
                </Link>
            </div>
        </div>
        <nav className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-1 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                  aria-label="User menu"
                  aria-haspopup="true"
                >
                 <UserIcon />
                </button>
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100"
                    role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                      <div className="py-1" role="none">
                        <Link to="/login" onClick={() => setDropdownOpen(false)} className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">Login/Register</Link>
                      </div>
                  </div>
                )}
              </div>
        </nav>
      </div>
    </header>
  );
};

export default React.memo(Header);