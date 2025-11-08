import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ProfileContext } from '../App';
import { LoadingSpinnerIcon, UserIcon, HamburgerIcon, BellIcon } from './Icons';
import type { BackgroundTask } from '../types';

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const profileContext = useContext(ProfileContext);
  const navigate = useNavigate();
  
  const location = useLocation();
  const isAppPage = !['/', '/login'].includes(location.pathname);
  const { isSidebarCollapsed } = profileContext!;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const buttonClasses = "inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all";
  const enabledClasses = "bg-brand-blue hover:bg-blue-700 hover:shadow-lg";

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

  const { backgroundTasks, markTaskAsViewed, clearAllNotifications } = profileContext!;
  const completedTasks = backgroundTasks.filter(t => t.status === 'completed' || t.status === 'error').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const hasUnreadNotifications = completedTasks.some(t => !t.viewed);

  const handleNotificationClick = (task: BackgroundTask) => {
      setNotificationDropdownOpen(false);
      markTaskAsViewed(task.id);

      if (task.status === 'error') {
          alert(`Generation failed: ${task.result?.message || 'Unknown error'}`);
          return;
      }

      switch (task.type) {
          case 'document-generation':
              navigate('/generate/results', { state: task.result });
              break;
          case 'coffee-chat':
              navigate('/coffee-chats/result', { state: task.result });
              break;
          case 'career-path':
              navigate('/career-path');
              break;
          case 'interview-prep':
              navigate('/interview-prep', { state: { result: task.result } });
              break;
      }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      <div className="mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-x-4">
          {isAppPage && (
            <button
              onClick={() => profileContext?.setIsSidebarOpen(true)}
              className="p-2 rounded-full text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue lg:hidden"
              aria-label="Open navigation menu"
            >
              <HamburgerIcon />
            </button>
          )}
          <Link to={isAppPage ? "/builder" : "/"} className={`flex items-center ${isAppPage && !isSidebarCollapsed ? 'lg:hidden' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-brand-blue mr-3 ${isAppPage && isSidebarCollapsed ? 'lg:hidden' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 4a1 1 0 00-.526.92V15a1 1 0 00.526.92l7 4a1 1 0 00.788 0l7-4a1 1 0 00.526-.92V6.994a1 1 0 00-.526-.92l-7-4zM10 18.341L3.5 14.5v-7.842L10 10.341v8zM16.5 14.5L10 18.341v-8L16.5 6.658v7.842zM10 3.659l6.5 3.714-6.5 3.715L3.5 7.373 10 3.659z" />
            </svg>
            <h1 className="text-2xl font-bold text-slate-900">
              Keju
            </h1>
          </Link>
          {!isAppPage && (
            <div className="hidden md:flex items-center space-x-6">
                <a href="#how-it-works" onClick={handleScroll} className="text-sm font-medium text-slate-700 hover:text-brand-blue transition-colors duration-200">
                    How it works
                </a>
                <Link to="/subscription" className="text-sm font-medium text-slate-700 hover:text-brand-blue transition-colors duration-200">
                    Pricing
                </Link>
            </div>
          )}
        </div>
        <nav className="flex items-center space-x-4">
            {!isAppPage ? (
              // Public Page Header: Dropdown with just Login/Register
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
            ) : (
              // App Header: Full controls
              <>
                <Link
                  to="/career-coach"
                  className={`${buttonClasses} ${enabledClasses}`}
                  role="button"
                >
                  Career Coach
                </Link>
                
                <div className="relative" ref={notificationDropdownRef}>
                    <button
                        onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                        className="relative p-1 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                        aria-label="View notifications"
                    >
                        <BellIcon />
                        {hasUnreadNotifications && (
                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                        )}
                    </button>
                    {notificationDropdownOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                            <div className="px-4 py-3 border-b border-slate-200">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                                    {completedTasks.length > 0 && <button onClick={() => { clearAllNotifications(); setNotificationDropdownOpen(false); }} className="text-xs text-brand-blue hover:underline">Clear all</button>}
                                </div>
                            </div>
                            <div className="py-1 max-h-80 overflow-y-auto">
                                {completedTasks.length > 0 ? (
                                    completedTasks.map(task => (
                                        <div key={task.id} onClick={() => handleNotificationClick(task)} className={`block px-4 py-3 text-sm cursor-pointer hover:bg-slate-100 ${!task.viewed ? 'bg-blue-50' : ''}`}>
                                            <p className={`font-medium ${task.status === 'error' ? 'text-red-600' : 'text-slate-800'}`}>
                                                {task.description} {task.status === 'completed' ? 'is ready!' : 'failed.'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">{new Date(task.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-4">No new notifications.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
              </>
            )}
        </nav>
      </div>
    </header>
  );
};

export default React.memo(Header);