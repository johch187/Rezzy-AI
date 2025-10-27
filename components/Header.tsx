import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { LoadingSpinnerIcon, TokenIcon, UserIcon, HamburgerIcon } from './Icons';

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileContext = useContext(ProfileContext);
  const isFetchingUrl = profileContext?.isFetchingUrl ?? false;

  const location = useLocation();
  const isLandingPage = location.pathname === '/';

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
  
  const buttonClasses = "inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all";
  const enabledClasses = "bg-primary hover:bg-blue-700 hover:shadow-lg";
  const disabledClasses = "bg-primary/60 cursor-not-allowed";

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerOffset = 80; // Estimated height of the sticky header
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
            window.scrollTo({
                 top: offsetPosition,
                 behavior: "smooth"
            });
        }
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
      <div className="mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-x-4">
          {!isLandingPage && (
            <button
              onClick={() => profileContext?.setIsSidebarOpen(true)}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-label="Open navigation menu"
            >
              <HamburgerIcon />
            </button>
          )}
          <Link to={isLandingPage ? "/" : "/builder"} className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 4a1 1 0 00-.526.92V15a1 1 0 00.526.92l7 4a1 1 0 00.788 0l7-4a1 1 0 00.526-.92V6.994a1 1 0 00-.526-.92l-7-4zM10 18.341L3.5 14.5v-7.842L10 10.341v8zM16.5 14.5L10 18.341v-8L16.5 6.658v7.842zM10 3.659l6.5 3.714-6.5 3.715L3.5 7.373 10 3.659z" />
            </svg>
            <h1 className="text-2xl font-bold text-neutral">
              AI Resume Builder
            </h1>
          </Link>
          {isLandingPage && (
            <div className="hidden md:flex items-center space-x-6">
                <a href="#how-it-works" onClick={handleScroll} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200">
                    How it works
                </a>
                <Link to="/subscription" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200">
                    Pricing
                </Link>
            </div>
          )}
        </div>
        <nav className="flex items-center space-x-4">
            {isLandingPage ? (
              // Landing Page Header: Dropdown with just Login/Register
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  aria-label="User menu"
                  aria-haspopup="true"
                >
                 <UserIcon />
                </button>
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100"
                    role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                      <div className="py-1" role="none">
                        <Link to="/login" onClick={() => setDropdownOpen(false)} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Login/Register</Link>
                      </div>
                  </div>
                )}
              </div>
            ) : (
              // App Header: Full controls
              <>
                <Link
                  to="/generate"
                  className={`${buttonClasses} ${isFetchingUrl ? disabledClasses : enabledClasses}`}
                  onClick={(e) => { if (isFetchingUrl) e.preventDefault(); }}
                  aria-disabled={isFetchingUrl}
                  role="button"
                >
                  {isFetchingUrl ? (
                    <>
                      <LoadingSpinnerIcon className="h-5 w-5 mr-2" />
                      Fetching...
                    </>
                  ) : (
                    'Tailor for New Role'
                  )}
                </Link>
                
                <div className="flex items-center space-x-2">
                    {profileContext && (
                        <div className="flex items-stretch rounded-full bg-gray-100 border border-gray-200 text-sm font-medium shadow-sm">
                            <div className="flex items-center space-x-2 px-3 py-1.5 text-gray-700" aria-live="polite">
                                <TokenIcon />
                                <span className="font-bold text-gray-900">{profileContext.tokens}</span>
                                <span className="hidden sm:inline">Tokens</span>
                            </div>
                            <Link
                                to="/subscription"
                                className="flex items-center justify-center px-2 border-l border-gray-300 text-gray-600 hover:bg-gray-200 rounded-r-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors"
                                title="Get More Tokens"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </Link>
                        </div>
                    )}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        aria-label="User menu"
                        aria-haspopup="true"
                      >
                       <UserIcon />
                      </button>
                      {dropdownOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100"
                          role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                            <div className="py-1" role="none">
                              <Link to="/builder" onClick={() => setDropdownOpen(false)} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">My Profile</Link>
                              <Link to="/account" onClick={() => setDropdownOpen(false)} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Account Settings</Link>
                              <div className="border-t border-gray-100 my-1"></div>
                              <Link to="/" onClick={() => setDropdownOpen(false)} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Logout</Link>
                            </div>
                        </div>
                      )}
                    </div>
                </div>
              </>
            )}
        </nav>
      </div>
    </header>
  );
};

export default React.memo(Header);