import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import { UserIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from './ui/sidebar';

interface ProfileMenuProps {
  isCollapsed?: boolean;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ isCollapsed = false }) => {
  const profileContext = useContext(ProfileContext);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { open: sidebarOpen } = useSidebar();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!profileContext) return null;
  const { profile, tokens } = profileContext;

  const displayName = profile?.fullName || profile?.name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-3 p-2 rounded-lg 
          text-gray-600 hover:bg-gray-100 transition-colors
          ${isCollapsed ? 'justify-center' : ''}
        `}
      >
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
          {initials || <UserIcon className="w-4 h-4" />}
        </div>
        
        {!isCollapsed && sidebarOpen && (
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-400">{tokens} tokens</p>
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="py-1">
              <Link
                to="/builder"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit Profile
              </Link>
              <Link
                to="/subscription"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Subscription
              </Link>
              <Link
                to="/account"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;
