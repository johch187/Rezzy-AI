import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileContext } from '../App';
import { UserIcon, TokenIcon, ChevronDownIcon } from './Icons';
import type { BackgroundTask } from '../types';

const ProfileMenu: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
    const profileContext = useContext(ProfileContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!profileContext) return null;

    const { profile, tokens } = profileContext;

    return (
        <div className="relative" ref={dropdownRef}>
            {isCollapsed ? (
                <div className="flex flex-col items-center justify-center gap-y-2">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`w-full flex items-center p-2 rounded-lg justify-center transition-colors duration-200 ${dropdownOpen ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
                        aria-haspopup="true"
                        aria-expanded={dropdownOpen}
                        aria-label="Open profile menu"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-slate-600" />
                        </div>
                    </button>
                </div>
            ) : (
                <div className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-slate-100 ${dropdownOpen ? 'bg-slate-100' : ''}`}>
                    <Link to="/builder" onClick={() => setDropdownOpen(false)} className="flex-grow flex items-center min-w-0" aria-label="Go to my profile">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-slate-600" />
                        </div>
                        <div className="text-left ml-3 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{profile?.fullName || profile?.name || 'Profile'}</p>
                            <p className="text-xs text-slate-500 truncate">Intern Plan</p>
                        </div>
                    </Link>
                     <div className="flex items-center flex-shrink-0">
                        <button
                            onClick={() => setDropdownOpen(prev => !prev)}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-slate-200"
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                            aria-label="Toggle profile menu"
                        >
                            <ChevronDownIcon className={`h-5 w-5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            )}

            {dropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 w-64 rounded-lg shadow-2xl bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="p-2">
                        <Link to="/subscription" onClick={() => setDropdownOpen(false)} className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md text-slate-700 hover:bg-slate-100">
                            <span>My Tokens</span>
                            <div className="flex items-center space-x-2 font-semibold text-brand-blue bg-blue-100 px-2 py-0.5 rounded-full">
                                <TokenIcon />
                                <span>{tokens}</span>
                            </div>
                        </Link>
                    </div>

                    <div className="border-t border-slate-200 p-2">
                         <Link to="/builder" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-3 py-2 text-sm rounded-md text-slate-700 hover:bg-slate-100">My Profile</Link>
                         <Link to="/account" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-3 py-2 text-sm rounded-md text-slate-700 hover:bg-slate-100">Account & Subscription</Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileMenu;